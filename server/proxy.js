// ============================================================================
// Proxy HTTP de Gemini para el prototipo ICA (Node 18+, sin dependencias).
// Nginx enruta POST /api/gemini hacia este servidor; la API key solo existe
// en la variable de entorno GEMINI_API_KEY del contenedor.
// ============================================================================

const http = require('http');

const coreListo = import('./gemini-core.mjs');
const RUTA_API = '/api/gemini';

function responderJson(res, status, cuerpo) {
    const texto = JSON.stringify(cuerpo);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(texto),
        'Cache-Control': 'no-store'
    });
    res.end(texto);
}

function leerCuerpo(req, limite) {
    return new Promise((resolve, reject) => {
        const partes = [];
        let total = 0;
        let excedido = false;

        req.on('data', (trozo) => {
            if (excedido) return;
            total += trozo.length;
            if (total > limite) {
                excedido = true;
                req.resume(); // drena el resto para poder responder 413 sin cortar la conexión
                const error = new Error('El cuerpo de la petición es demasiado grande.');
                error.status = 413;
                reject(error);
                return;
            }
            partes.push(trozo);
        });
        req.on('end', () => {
            if (!excedido) resolve(Buffer.concat(partes).toString('utf8'));
        });
        req.on('error', reject);
    });
}

async function manejarPeticion(req, res) {
    const core = await coreListo;
    const url = new URL(req.url || '/', 'http://localhost');

    if (url.pathname === RUTA_API) {
        if (req.method !== 'POST') {
            res.setHeader('Allow', 'POST');
            responderJson(res, 405, {
                error: { code: 405, message: 'Método no permitido. Use POST.' }
            });
            return;
        }

        let texto;
        try {
            texto = await leerCuerpo(req, core.MAX_CUERPO_BYTES);
        } catch (error) {
            responderJson(res, error.status || 400, {
                error: { code: error.status || 400, message: error.message }
            });
            return;
        }

        let cuerpo;
        try {
            cuerpo = JSON.parse(texto || '{}');
        } catch (e) {
            responderJson(res, 400, {
                error: {
                    code: 400,
                    message: 'El cuerpo debe ser JSON válido con { "modelo": "...", "payload": { ... } }.'
                }
            });
            return;
        }

        const ip = core.ipDesdeCabeceras(req.headers, req.socket && req.socket.remoteAddress);
        const salida = await core.manejarPostGemini({ cuerpo, ip });
        responderJson(res, salida.status, salida.body);
        return;
    }

    if (url.pathname === RUTA_API + '/health' && req.method === 'GET') {
        responderJson(res, 200, { ok: true });
        return;
    }

    responderJson(res, 404, {
        error: { code: 404, message: 'Ruta no encontrada. Use POST ' + RUTA_API + '.' }
    });
}

function crearServidor() {
    return http.createServer((req, res) => {
        manejarPeticion(req, res).catch((error) => {
            console.error('Error en el proxy de Gemini:', error && error.message ? error.message : error);
            if (!res.headersSent) {
                responderJson(res, 500, {
                    error: { code: 500, message: 'Error interno del proxy de Gemini.' }
                });
            } else {
                res.end();
            }
        });
    });
}

function iniciarProxy({ puerto = Number(process.env.PORT) || 3000, host = process.env.HOST || '127.0.0.1' } = {}) {
    const servidor = crearServidor();
    return new Promise((resolve, reject) => {
        servidor.once('error', reject);
        servidor.listen(puerto, host, () => {
            console.log('Proxy de Gemini escuchando en http://' + host + ':' + puerto + RUTA_API);
            if (!process.env.GEMINI_API_KEY) {
                console.warn('GEMINI_API_KEY no está configurada: /api/gemini responderá 503.');
            }
            resolve(servidor);
        });
    });
}

if (require.main === module) {
    iniciarProxy().catch((error) => {
        console.error('No se pudo iniciar el proxy de Gemini:', error && error.message ? error.message : error);
        process.exit(1);
    });
}

module.exports = { crearServidor, iniciarProxy, RUTA_API };
