// ============================================================================
// Adaptador serverless para Vercel: POST /api/gemini
// La API key se lee de la variable de entorno GEMINI_API_KEY del proyecto
// (Project Settings → Environment Variables). Nunca se envía al navegador.
// ============================================================================

const coreListo = import('../server/gemini-core.mjs');

function leerTextoDeStream(req) {
    return new Promise((resolve, reject) => {
        const partes = [];
        let total = 0;
        req.on('data', (trozo) => {
            total += trozo.length;
            if (total > 256 * 1024) {
                reject(Object.assign(new Error('El cuerpo de la petición es demasiado grande.'), { status: 413 }));
                return;
            }
            partes.push(trozo);
        });
        req.on('end', () => resolve(Buffer.concat(partes).toString('utf8')));
        req.on('error', reject);
    });
}

async function leerCuerpo(req, limite) {
    if (req.body !== undefined && req.body !== null && req.body !== '') {
        if (Buffer.isBuffer(req.body)) {
            const texto = req.body.toString('utf8');
            if (Buffer.byteLength(texto) > limite) return { error: 413 };
            return { texto };
        }
        if (typeof req.body === 'object') return { objeto: req.body };
        return { texto: String(req.body) };
    }
    const texto = await leerTextoDeStream(req);
    if (Buffer.byteLength(texto) > limite) return { error: 413 };
    return { texto };
}

function responder(res, status, cuerpo) {
    const texto = JSON.stringify(cuerpo);
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(texto);
}

module.exports = async function handler(req, res) {
    const core = await coreListo;

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        responder(res, 405, { error: { code: 405, message: 'Método no permitido. Use POST.' } });
        return;
    }

    let cuerpo;
    try {
        const leido = await leerCuerpo(req, core.MAX_CUERPO_BYTES);
        if (leido.error) {
            responder(res, 413, { error: { code: 413, message: 'El cuerpo de la petición es demasiado grande.' } });
            return;
        }
        cuerpo = leido.objeto !== undefined ? leido.objeto : JSON.parse(leido.texto || '{}');
    } catch (error) {
        const status = error && error.status ? error.status : 400;
        responder(res, status, {
            error: {
                code: status,
                message: status === 413 ? error.message
                    : 'El cuerpo debe ser JSON válido con { "modelo": "...", "payload": { ... } }.'
            }
        });
        return;
    }

    const ip = core.ipDesdeCabeceras(req.headers, req.socket && req.socket.remoteAddress);
    const salida = await core.manejarPostGemini({ cuerpo, ip });
    responder(res, salida.status, salida.body);
};
