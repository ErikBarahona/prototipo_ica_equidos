# PROMPT PARA GENERAR EL MOCKUP — Sistema ICA de Bienestar Animal en Équidos

Prompts listos para copiar y pegar en generadores de mockups/UI
(**v0, Figma AI, Uizard, Galileo AI, Visily, ChatGPT/DALL·E, Midjourney**, etc.),
construidos a partir del prototipo HTML/CSS de `prototipo_ica_equidos/`.

> Para **herramientas de UI generativa** usa el *Prompt Maestro (ES)*.
> Para **generadores de imagen** usa el *Prompt Maestro (EN)*.

---

## 1. Sistema de diseño (tokens reales del prototipo)

| Token | Valor |
|---|---|
| Verde ICA (primario) | `#2E7331` |
| Verde oscuro (hover) | `#245A27` |
| Verde brillante | `#00983F` |
| Lima | `#86BB36` |
| Amarillo ICA (acento) | `#C2C700` |
| Amarillo suave | `#F3F5CC` |
| Fondo general | `#F4F6F2` |
| Superficie / tarjetas | `#FFFFFF` |
| Texto principal | `#22301F` · secundario `#5F6B5C` |
| Bordes | `#DDE3D8` |
| Encabezado de sección | `#EDF3E9` |
| Fila alterna de tabla | `#FAFBF9` · cabecera `#F1F4EE` |
| Alerta / suspensión | fondo `#FDECEC`, borde `#E7A5A5` |
| Plan de mejora | fondo `#FBF8E4`, borde `#C2C700` |
| Badge Excelente | `#2E7331` (texto blanco) |
| Badge Alto | `#00983F` (texto blanco) |
| Badge Medio | `#C2C700` (texto oscuro) |
| Badge Bajo | `#C62828` (texto blanco) |
| Tipografía | Sans-serif del sistema (Segoe UI / Roboto / Helvetica Neue) |
| Radios | 8 px tarjetas · 4 px controles · 999 px badges |
| Sombra | `0 1px 3px rgba(0,0,0,0.08)` |

**Logo:** logo oficial del ICA (verde/amarillo) en la cabecera del menú lateral y en el login.
**Navegación:** menú lateral izquierdo fijo (264 px) + barra superior con la finca activa.
**Estilo:** institucional, sobrio, limpio, tipo panel administrativo de sanidad agropecuaria.
Sin degradados llamativos. Español (Colombia). Escritorio responsive.

---

## 2. Prompt Maestro (ES) — para herramientas de UI generativa

```
Genera un mockup de alta fidelidad de una aplicación web (escritorio, responsive) llamada
"Sistema ICA – Bienestar Animal en Équidos". Es una plataforma administrativa para evaluar el
bienestar animal en équidos según la norma ICA V2.0 (2023), con el logo oficial del ICA
(Instituto Colombiano Agropecuario) en el encabezado.

ESTILO VISUAL:
- Institucional, sobrio y limpio, tipo panel de una entidad de sanidad agropecuaria.
- Paleta ICA: verde #2E7331 (primario), verde brillante #00983F, lima #86BB36 y amarillo #C2C700.
  Fondo de página #F4F6F2. Tarjetas blancas, radio 8 px, sombra sutil.
- Texto #22301F, secundario #5F6B5C, bordes #DDE3D8. Tipografía Segoe UI / Roboto.
- Menú lateral izquierdo fijo de 264 px, fondo verde #2E7331: cabecera blanca con el logo ICA y
  el título del sistema; navegación vertical con la pestaña activa resaltada con borde izquierdo
  amarillo #C2C700 y fondo verde translúcido; al pie, usuario y botón "Cerrar sesión".
  Ítems: Dashboard, Fincas, Inventario, Nueva evaluación, Evaluación en curso, Historial,
  Plan de mejora.
- Barra superior blanca con borde inferior gris: título de la pantalla a la izquierda y chip
  amarillo claro "Finca activa: La Esperanza" a la derecha.
- Contenido a la derecha del menú lateral, ancho máximo 1180 px.
- Botones primarios verdes #2E7331; secundarios grises; peligro rojo #C62828.
- Tablas limpias con cabecera #F1F4EE, filas alternas #FAFBF9 y bordes #DDE3D8.
- Insignias tipo píldora: Excelente #2E7331, Alto #00983F, Medio #C2C700 (texto oscuro),
  Bajo #C62828.

PANTALLAS A GENERAR (galería de 10 pantallas coherentes):
1) LOGIN: tarjeta blanca centrada (~430 px) con el logo ICA arriba, título "Ingreso al sistema",
   campos Usuario y Contraseña, botón verde "Ingresar".
2) DASHBOARD: 4 tarjetas de métricas con borde izquierdo verde (Fincas registradas, Équidos en la
   finca activa, Evaluaciones, Última clasificación) y tabla "Evaluaciones recientes" (Finca,
   Capítulo, Fecha, Etapa, Estado, Puntaje, Clasificación).
3) FINCAS: formulario completo (nombre, propietario, departamento, municipio, vereda, coordenadas,
   msnm, tipo de predio, sistema productivo) y tabla de fincas con botón "Seleccionar" y una fila
   resaltada en amarillo claro marcada como "Activa".
4) INVENTARIO: formulario de grupos (Especie: Caballar/Asnal/Mular/Burdégano/Cebroide; Grupo
   etario; Sexo; Cantidad; Identificación; Ubicación), tabla de grupos, y una tarjeta con la
   "Tabla 1 – Muestra mínima" resaltando el rango activo (p. ej. 21–99 → 20).
5) NUEVA EVALUACIÓN: tarjeta con la finca activa en modo lectura (sin selector de finca),
   selector de Capítulo I (43 indicadores) / Capítulo II (32) y botón "Iniciar evaluación".
6) ETAPA I – REUNIÓN INICIAL: stepper de 4 etapas arriba; información básica del predio en una
   cuadrícula; recuadro con "Total de équidos: 25 · Muestra mínima: 20 · Rango 21–99"; Tabla 1;
   selección de potreros y corrales como chips; botón "Finalizar Etapa I y continuar".
7) ETAPA II – INSPECCIÓN DE CAMPO: indicadores agrupados por las 5 Libertades, cada sección con
   encabezado verde claro e insignias de cantidad y peso (20 %, 15 %, 30 %, 15 %, 20 %). Cada
   indicador es una ficha con: código, descripción, insignia de método "Visual", metodología,
   preguntas para evaluar, escala de calificación en chips (100 · Excelente, 55 · Medio,
   20 · Bajo, 0 · Bajo (no cumple)), desplegable de puntaje y casilla "Requiere tratamiento".
   Abajo, botones "Guardar y continuar a Etapa III" y "Suspender evaluación" (rojo).
8) ETAPA III – REVISIÓN DOCUMENTAL: tabla de documentos (Certificado de vacunación, tratamientos,
   historias clínicas, desparasitación, calidad del agua, protocolo de manejo, guía de
   movilización) con columnas Estado (Presenta / Se niega / No aplica), Firmado, Matrícula
   MV/MVZ–COMVEZCOL, Observación y Puntaje. Debajo, fichas de los indicadores documentales con
   método "Documental", metodología, preguntas, documento asociado y escala 100/55/20/0.
9) ETAPA IV – RESULTADOS: tarjeta con puntaje final grande (p. ej. 87.50 %), insignia "Alto",
   barra horizontal de escala Bajo <50 · Medio 50–74 · Alto 75–89 · Excelente ≥90 con un marcador
   en el puntaje; tabla por libertad (peso, evaluados, promedio, ponderado); tabla con TODOS los
   indicadores del predio (código, libertad, indicador, puntaje, tratamiento); botón "Descargar
   acta (PDF)".
10) PLAN DE MEJORA + HISTORIAL: historial de evaluaciones con estado, puntaje y clasificación;
    plan de mejora en tarjeta crema con borde amarillo, tabla de hallazgos (Indicador, Libertad,
    Puntaje, Prioridad, Acción, Responsable, Fecha límite) y botón "Exportar plan de mejora (PDF)".

REQUISITOS DE COHERENCIA: mismos colores, tipografía y componentes en todas las pantallas.
Español (Colombia). Sin imágenes de marcas reales distintas del ICA. Diseño plano, ordenado,
profesional y accesible.
```

---

## 3. Prompt Maestro (EN) — para generadores de imagen

```
High-fidelity UI mockup set of a desktop web application called "ICA Equine Animal Welfare
System" (Spanish-language, Colombia). Institutional veterinary-authority dashboard: clean, flat,
generous white space, subtle shadows, no gradients.

Brand: official ICA (Instituto Colombiano Agropecuario) green/yellow logo in the sidebar header.
Design tokens: primary green #2E7331, bright green #00983F, lime #86BB36, ICA yellow #C2C700,
page background #F4F6F2, white cards with 8px radius, body text #22301F, secondary text #5F6B5C,
borders #DDE3D8. Sans-serif typography. Fixed 264px left sidebar in green #2E7331: white brand
header with ICA logo and system title; vertical navigation with the active item highlighted by a
yellow #C2C700 left border and translucent background; user and "Cerrar sesión" at the bottom.
White top bar with the screen title on the left and a pale-yellow chip "Finca activa: La
Esperanza" on the right. Content to the right of the sidebar, max width 1180px. Primary green
buttons, gray secondary, red danger. Clean tables with #F1F4EE header and #FAFBF9 alternating
rows. Pill badges: Excelente #2E7331, Alto #00983F, Medio #C2C700 (dark text), Bajo #C62828.

Generate 10 consistent screens:
1) Login (centered white card, ICA logo, Usuario/Contraseña, green "Ingresar").
2) Dashboard (4 metric cards with green left border + recent evaluations table).
3) Farms "Fincas" (full registration form + table with "Seleccionar" and an active row
   highlighted in pale yellow).
4) Equine Inventory (species/age-group/sex/quantity group form, groups table, and a
   "Tabla 1 – Muestra mínima" card highlighting the active range).
5) New Evaluation (active farm shown read-only, chapter I/II selector, "Iniciar evaluación").
6) Stage I – Initial meeting (4-step stepper, farm summary grid, total animals + minimum sample
   box, sample table, paddock/corral chips, "Finalizar Etapa I").
7) Stage II – Field inspection (indicators grouped into 5 freedoms with count and weight badges
   20%,15%,30%,15%,20%; each indicator is a card with code, description, "Visual" method badge,
   methodology, evaluation questions, a four-chip scale 100 Excelente / 55 Medio / 20 Bajo /
   0 Bajo (no cumple), score dropdown and "Requiere tratamiento" checkbox; green "Guardar y
   continuar" and red "Suspender evaluación").
8) Stage III – Documentary review (documents table: Estado Presenta/Se niega/No aplica, Firmado,
   MV/MVZ–COMVEZCOL license, Observation, Score; below, documentary indicator cards with
   "Documental" method badge, methodology, questions, associated document and the 100/55/20/0
   scale).
9) Stage IV – Results (large final score, classification badge, horizontal scale
   Bajo<50 / Medio 50–74 / Alto 75–89 / Excelente≥90 with marker, per-freedom table, full
   indicator table, "Descargar acta (PDF)").
10) Improvement Plan + History (evaluation history table; cream card with yellow border and
    findings table: Indicator, Freedom, Score, Priority, Action, Responsible, Due date;
    "Exportar plan de mejora (PDF)").

Flat, professional, orderly, accessible. Consistent components across screens. Spanish UI.
--ar 16:9
```

---

## 4. Prompts individuales (uno por pantalla)

Antepón siempre este bloque:

**[BLOQUE DE ESTILO]**
```
App web institucional "Sistema ICA – Bienestar Animal en Équidos" con logo oficial del ICA.
Estilo plano, limpio, administrativo. Verde ICA #2E7331, verde brillante #00983F, lima #86BB36,
amarillo #C2C700, fondo #F4F6F2, tarjetas blancas radio 8px, texto #22301F, bordes #DDE3D8,
tipografía Segoe UI. Menú lateral izquierdo verde de 264px con cabecera blanca y logo ICA,
navegación vertical con ítem activo amarillo; barra superior blanca con chip "Finca activa".
Contenido a la derecha, máx. 1180px. Español (Colombia).
```

- **Login:** `[BLOQUE DE ESTILO] Tarjeta blanca centrada de 430px con el logo ICA, título "Ingreso al sistema", subtítulo "Evaluación del bienestar animal en équidos — ICA V2.0 (2023)", campos Usuario y Contraseña, botón verde "Ingresar". Sin menú.`

- **Dashboard:** `[BLOQUE DE ESTILO] Panel con 4 tarjetas (Fincas registradas, Équidos en la finca activa, Evaluaciones, Última clasificación) con borde izquierdo verde y número grande; tabla "Evaluaciones recientes" (Finca, Capítulo, Fecha, Etapa, Estado, Puntaje, Clasificación) con insignias.`

- **Fincas:** `[BLOQUE DE ESTILO] Sección "Fincas": tarjeta con formulario completo (nombre, propietario, departamento, municipio, vereda, latitud, longitud, msnm, tipo, sistema) y botón verde "Guardar finca"; tabla de fincas con columnas y botón "Seleccionar"; la finca activa se resalta en amarillo claro con la insignia "Activa".`

- **Inventario:** `[BLOQUE DE ESTILO] Sección "Inventario equino": formulario de grupo (Especie, Grupo etario, Sexo, Cantidad, Identificación, Ubicación) y botón verde; tabla de grupos; tarjeta "Tamaño del predio y muestra mínima" con la leyenda "25 équidos → Muestra mínima: 20" y la Tabla 1 resaltando la fila 21–99.`

- **Nueva evaluación:** `[BLOQUE DE ESTILO] Sección "Nueva evaluación": tarjeta con la finca activa en modo lectura (sin selector), selector "Capítulo I — 43 indicadores" / "Capítulo II — 32 indicadores", recuadro informativo con el total de équidos y la muestra mínima, y botón verde "Iniciar evaluación".`

- **Etapa I:** `[BLOQUE DE ESTILO] Stepper de 4 etapas (I Reunión inicial activa, II Campo, III Documental, IV Resultados). Tarjeta "Etapa I — Reunión inicial" con cuadrícula de información del predio, recuadro "Total de équidos: 25 · Muestra mínima: 20 · Rango 21–99", Tabla 1, selección de potreros/corrales en chips y botón "Finalizar Etapa I y continuar".`

- **Etapa II:** `[BLOQUE DE ESTILO] Stepper con Etapa II activa. Indicadores agrupados por 5 Libertades, encabezado verde claro #EDF3E9 e insignias de cantidad y peso (20%, 15%, 30%, 15%, 20%). Cada indicador es una ficha con código verde, descripción, insignia de método "Visual", metodología, preguntas para evaluar, escala en chips (100 Excelente / 55 Medio / 20 Bajo / 0 Bajo (no cumple)), desplegable de puntaje y checkbox "Requiere tratamiento". Botones "Guardar y continuar a Etapa III" y "Suspender evaluación" en rojo.`

- **Etapa III:** `[BLOQUE DE ESTILO] Stepper con Etapa III activa. Tabla de documentos con columna Documento (vacunación, tratamientos, historias clínicas, desparasitación, calidad del agua, protocolo, guía de movilización), Estado (Presenta / Se niega / No aplica), Firmado, Matrícula MV/MVZ–COMVEZCOL, Observación y Puntaje. Debajo, fichas de indicadores documentales con método "Documental", metodología, preguntas, documento asociado y escala 100/55/20/0. Nota: "si se niega, el indicador se califica con 0".`

- **Etapa IV / Resultados:** `[BLOQUE DE ESTILO] Stepper con Etapa IV activa. Puntaje final grande "87.50 %", insignia "Alto", barra de escala Bajo <50 / Medio 50–74 / Alto 75–89 / Excelente ≥90 con marcador; tabla por libertad (peso, evaluados, promedio, ponderado); tabla de todos los indicadores del predio; botón "Descargar acta (PDF)".`

- **Plan de mejora:** `[BLOQUE DE ESTILO] Sección "Plan de mejora": tarjeta crema #FBF8E4 con borde izquierdo amarillo; tabla de hallazgos (Indicador, Libertad, Puntaje, Prioridad, Acción, Responsable, Fecha límite) con campos editables; botón verde "Exportar plan de mejora (PDF)".`

---

## 5. Prompt negativo (para IMEs de imagen)

```
No incluir degradados llamativos, sombras duras, glassmorphism, neón, 3D, ilustraciones
infantiles, texto ilegible, idioma inglés en la interfaz, logotipos de marcas reales distintas
del ICA, ni colores fuera de la paleta institucional verde/amarillo.
```

---

## 6. Consejos rápidos por herramienta

- **v0 / Figma AI / Uizard / Galileo / Visily:** pega el *Prompt Maestro (ES)*. Genera primero el
  Dashboard para fijar el sistema de diseño y luego pide "usa el mismo estilo" para las demás.
- **DALL·E / Ideogram:** pega el *Prompt Maestro (EN)*; pide una imagen por pantalla.
- **Midjourney:** usa el *Prompt Maestro (EN)* + `--ar 16:9 --style raw --v 6`; evita texto largo.
- **Coherencia:** usa el Dashboard como imagen de referencia en las siguientes generaciones.
- **Fidelidad total:** importa `index.html` en **Figma (html.to.design)** o pega el HTML/CSS en v0.

---

## 7. Prompt corto (una línea)

```
Mockup UI de un panel web administrativo "Sistema ICA – Bienestar Animal en Équidos" con logo
ICA, paleta verde #2E7331 / amarillo #C2C700 sobre fondo #F4F6F2, menú lateral izquierdo verde
con cabecera blanca y barra superior con chip de finca activa; 10 pantallas: login, dashboard,
fincas con selección de finca activa, inventario por grupos con Tabla 1 de muestra mínima, nueva
evaluación con finca en modo lectura, etapas I–IV (reunión inicial, inspección de campo con
fichas de indicador y suspensión, revisión documental con fichas documentales y resultados con
escala Excelente/Alto/Medio/Bajo), historial y plan de mejora con PDF.
Diseño coherente, limpio y profesional, escritorio responsive, español.
```

---

*Fuente del diseño: `prototipo_ica_equidos/index.html`, `css/styles.css` y `assets/logo-ica.png`.
Norma de referencia: ICA V2.0 (2023).*
