# AGENTS.md

## What this repo is

- Single-page, no-build prototype (HTML + CSS + vanilla JS) of the ICA equine animal-welfare evaluation system. No backend for the app itself: auth is fake and all data lives in `localStorage`. The only outbound call is the optional Gemini plan, which goes through the `/api/gemini` proxy (or directly to Google with a user-supplied key).
- **The core app must keep working by opening `index.html` directly (`file://`) and offline.** Only the AI plan needs the server or an own key. Do not introduce npm, bundlers, frameworks, ES modules in the frontend, or CDN dependencies. `js/html2pdf.bundle.min.js` is vendored for this reason; the Node proxy uses native modules only.
- UI text, docs, and most identifiers are Spanish (Colombia). Keep new user-facing copy in Spanish.

## Run and verify

- Run: double-click `index.html`, or `Start-Process .\index.html`.
- For the AI plan without a user key, run the Docker deployment: `Copy-Item .env.example .env` (set `GEMINI_API_KEY`), then `docker compose up --build` and open `http://localhost:8080`.
- Syntax check (there is no test/lint/build suite): `node --check js/data.js`, `node --check js/app.js`, `node --check server/proxy.js`, `node --check api/gemini.js`, `node --check functions/api/gemini.js` and `node --check server/gemini-core.mjs`.
- Seed/reset data: in DevTools run `localStorage.removeItem('ica_equidos_v3')`, then reload.
- Manual smoke path: login (any credentials) → create farm (becomes active) → add inventory group → new evaluation → Etapa I (add a potrero/corral) → Etapa II scores → Etapa III documents → Etapa IV finalize/PDF.

## Architecture

- `index.html` contains every screen. Each is `<section id="screen<Name>" class="screen">`; navigation uses `data-screen="<Name>"`, and `showScreen()` has an explicit `if` for each screen's render function. A new screen needs all three.
- `js/data.js` is the normative/runtime source of truth: freedoms, weights, indicator catalog, documents, sample table, scoring. Loaded first as classic globals.
- `js/app.js` holds `state`, persistence (`ica_equidos_v3`), render functions, and delegated `click`/`change` handlers (`data-action`, `data-plan`, etc.). Renders replace `innerHTML`, so dynamic controls must use delegation.
- `data/ica_catalogo.json` is an exported snapshot. **The app never fetches it**; editing it alone changes nothing. No generator is checked in, so keep it in sync manually when changing the catalog.
- `README_PROTOCOLO.md` documents behavior; `PROMPT_MOCKUP.md` is only copy-paste prompts for design tools, not runtime code.

## Domain rules that are easy to break

- Fixed by the ICA V2.0 (2023) norm: 5 freedoms weighted **20/15/30/15/20 %**, **C1 = 43** and **C2 = 32** indicators, scores only **0/20/55/100**, classification **≥90 Excelente, 75–89 Alto, 50–74 Medio, <50 Bajo**. The norm wins over user stories/docs on conflict.
- Catalog entries are keyed by **description text** in two places: `GUIA` and `DOCUMENTOS[].indicador`. Renaming a description silently breaks its methodology/questions or document mapping. `DESC.L*` order also matters because `FASE_DOCUMENTAL` selects documentary indicators by array index.
- `buildCapitulo` cycles `DESC.L*` with `i % pool.length`; if a `CONTEO` value ever exceeds its pool, descriptions repeat and the description-keyed lookups become ambiguous.
- C2 has no “Transporte sin hacinamiento” indicator, so document D7 deliberately shows “no aplica en este capítulo”.
- Documentary indicators: their score `<select>` is disabled by design; score comes from the documents table. “Se niega” forces score 0 + requires treatment; “Presenta” sets 100 only when unscored or 0.
- Scoring: each freedom averages **only scored** indicators (unscored are excluded, not zero), then applies the freedom weight. A freedom with no scored indicators contributes 0, but partially scoring a freedom is not penalized.
- Sample size (Tabla 1): <10 → all animals; 11–20 → 10; 21–99 → 20; 100–499 → 30; 500–999 → 40; ≥1000 → `ceil(5 %)`. Zero animals returns 0.

## Persistence gotchas

- Etapa I/II/III edits are **not autosaved**: scores and document fields persist only when their save button runs `capturarRespuestas`/`capturarDocumental`. The improvement-plan inputs are the exception and save on `change`.
- Etapa I requires at least one potrero/corral; incomplete Etapa II or finalization only shows a confirmation warning.
- `renderEvaluacion()` assigns `ev.resultados` as a render side effect (not saved); history/plan may recompute from answers.

## Gemini AI plan

- `generar-plan-ia` (Etapa IV and “Plan de mejora”) calls `generarPlanIA()`. The normal path uses the server proxy `/api/gemini`, whose key lives only in the `GEMINI_API_KEY` environment variable. A user key is optional (advanced mode) and stored unencrypted in `localStorage` under `ica_gemini_api_key`; never commit or log either key.
- Hybrid mode in `solicitarPlanGemini()`: with a saved user key the browser calls Google directly and sends `x-goog-api-key`; without one it sends `{ modelo, payload }` to `/api/gemini`. If a saved key is rejected (401/403), it is cleared and the same request is retried through the proxy. On `file://` without a key, the UI explains that the server is required.
- The request sends compact structured JSON from `construirDatosEvaluacionIA()` to the `GEMINI_MODELS` list (`gemini-3.8-flash`, `gemini-3.8-flash-lite`, `gemini-3-flash-preview`), not the rendered PDF. The payload carries the global/per-freedom numeric summary, only indicators scored below 75, and only documents whose state is not "Presenta". It retries 429/500/503 once (1.5 s wait) and falls back to the next model on 404/503. The result is saved separately as `ev.planIA`, leaving the manual `ev.plan` intact.
- Errors produced by the proxy itself carry `error.origen = 'proxy_ica'` (missing key, rate limit, invalid model/payload); they stop the loop immediately and show the server message. Upstream Google errors are passed through unchanged and keep the normal retry/fallback behavior.
- Each Gemini `fetch` runs under an `AbortController` with a `GEMINI_TIMEOUT_MS` (15 s) limit, cleared in `finally`. A timeout does not retry the same model: it moves straight to the next one; if every model times out, the toast reports the 15 s limit and the last model tried.
- `generationConfig` requests `thinkingConfig: { thinkingLevel: 'LOW' }` to keep latency low. If a model rejects that field with HTTP 400, the same request is retried once without `thinkingConfig`; an unrelated 400 is not retried. The loading button shows the elapsed seconds.
- The AI response is re-filtered against the evaluation before saving and again when rendering (`filtrarHallazgosIA` / `filtrarDocumentosIA`): only indicators whose real score is below 75 and documents whose real state is not "Presenta" are shown, even for plans generated before the filter existed.
- PDF export sets `pagebreak: { mode: ['css', 'legacy'], avoid: [...] }` and the CSS uses `break-inside: avoid` so findings cards, table rows, and summary/recommendation blocks are not split across pages.
- PDF export reuses `exportPdf()`/html2pdf. Elements marked `data-pdf-ignore` (for example the AI toolbar) are hidden during export.

## Gemini proxy and deployment

- `POST /api/gemini` accepts `{ modelo, payload }`. `server/gemini-core.mjs` is the shared, dependency-free core: allowed-model list, 15 requests/minute/IP sliding window, 256 KB body limit, 20 s upstream timeout, and the call to `https://generativelanguage.googleapis.com/v1beta/models/<modelo>:generateContent?key=...`.
- Adapters: `server/proxy.js` (Node `http` server, `PORT` default 3000, binds `127.0.0.1` by default) serves both `/api/gemini` and `/api/gemini/health`; `api/gemini.js` is the Vercel function; `functions/api/gemini.js` is the Cloudflare Pages Function. Rate limiting is in-memory and per instance (best effort in serverless).
- Docker: the image installs `nodejs` on `nginx:alpine` and starts the proxy from `/docker-entrypoint.d/40-gemini-proxy.sh`; `nginx/default.conf` proxies `/api/gemini` to `127.0.0.1:3000` and exposes only the static app. `docker-compose.yml` passes `GEMINI_API_KEY` from the environment/`.env`; `.env.example` documents it, `.gitignore` excludes `.env` and `.dockerignore` keeps it out of the build context.
- The key is never served by Nginx, never embedded in the frontend, and never written to `localStorage` unless a user explicitly saves an own key in “Configuración avanzada: usar clave propia”.
