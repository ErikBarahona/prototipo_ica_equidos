// ============================================================================
// Adaptador para Cloudflare Pages Functions: POST /api/gemini
// Requiere configurar GEMINI_API_KEY en Settings → Environment variables.
// El límite por IP es en memoria y por instancia (mejor esfuerzo).
// ============================================================================

import {
    manejarPostGemini,
    ipDesdeCabeceras,
    MAX_CUERPO_BYTES
} from '../../server/gemini-core.mjs';

function json(status, cuerpo) {
    return new Response(JSON.stringify(cuerpo), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store'
        }
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;

    const largo = Number(request.headers.get('content-length') || 0);
    if (largo > MAX_CUERPO_BYTES) {
        return json(413, { error: { code: 413, message: 'El cuerpo de la petición es demasiado grande.' } });
    }

    const texto = await request.text();
    if (new TextEncoder().encode(texto).length > MAX_CUERPO_BYTES) {
        return json(413, { error: { code: 413, message: 'El cuerpo de la petición es demasiado grande.' } });
    }

    let cuerpo;
    try {
        cuerpo = JSON.parse(texto || '{}');
    } catch (e) {
        return json(400, {
            error: {
                code: 400,
                message: 'El cuerpo debe ser JSON válido con { "modelo": "...", "payload": { ... } }.'
            }
        });
    }

    const ip = ipDesdeCabeceras(request.headers, request.headers.get('cf-connecting-ip'));
    const salida = await manejarPostGemini({
        cuerpo,
        ip,
        apiKey: env && env.GEMINI_API_KEY
    });
    return json(salida.status, salida.body);
}

export async function onRequest(context) {
    if (context.request.method === 'POST') return onRequestPost(context);
    return json(405, { error: { code: 405, message: 'Método no permitido. Use POST.' } });
}
