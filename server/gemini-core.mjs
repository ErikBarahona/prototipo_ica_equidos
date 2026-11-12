// ============================================================================
// Núcleo del proxy de Gemini — sin dependencias externas.
// Lo usan server/proxy.js (Node), api/gemini.js (Vercel) y
// functions/api/gemini.js (Cloudflare Pages). No expone nunca la API key:
// la lee de GEMINI_API_KEY y la añade solo en la llamada al servidor de Google.
// ============================================================================

export const MODELOS_PERMITIDOS = Object.freeze([
    'gemini-3.8-flash',
    'gemini-3.8-flash-lite',
    'gemini-3-flash-preview'
]);

export const LIMITE_PETICIONES = 15;
export const VENTANA_LIMITE_MS = 60 * 1000;
export const MAX_CUERPO_BYTES = 256 * 1024;
export const TIEMPO_MAX_GEMINI_MS = 20000;
export const ORIGEN_PROXY = 'proxy_ica';

const intentosPorIp = new Map();

/** Devuelve la clave del servidor, o '' si no está configurada. */
export function claveDesdeEntorno() {
    if (typeof process !== 'undefined' && process.env) {
        return String(process.env.GEMINI_API_KEY || '').trim();
    }
    return '';
}

/** IP del cliente, respetando X-Forwarded-For cuando hay un proxy delante. */
export function ipDesdeCabeceras(headers, ipRemota) {
    const leer = (nombre) => {
        if (!headers) return '';
        if (typeof headers.get === 'function') return headers.get(nombre) || '';
        const valor = headers[nombre] !== undefined ? headers[nombre] : headers[nombre.toLowerCase()];
        return Array.isArray(valor) ? valor[0] : (valor || '');
    };
    const reenviada = String(leer('x-forwarded-for') || '').split(',')[0].trim();
    const real = String(leer('x-real-ip') || '').trim();
    return reenviada || real || String(ipRemota || '').trim() || 'desconocida';
}

/**
 * Límite básico por IP (ventana deslizante). Registra el intento y devuelve
 * true si la petición puede continuar.
 */
export function permitirPeticion(ip, ahora = Date.now()) {
    const clave = String(ip || 'desconocida');
    if (intentosPorIp.size > 5000) {
        for (const [otraIp, marcas] of intentosPorIp) {
            if (!marcas.some(marca => ahora - marca < VENTANA_LIMITE_MS)) intentosPorIp.delete(otraIp);
        }
    }
    const marcas = (intentosPorIp.get(clave) || [])
        .filter(marca => ahora - marca < VENTANA_LIMITE_MS);
    if (marcas.length >= LIMITE_PETICIONES) {
        intentosPorIp.set(clave, marcas);
        return false;
    }
    marcas.push(ahora);
    intentosPorIp.set(clave, marcas);
    return true;
}

/** Solo para pruebas: vacía el contador del límite. */
export function reiniciarLimitePeticiones() {
    intentosPorIp.clear();
}

export function esModeloPermitido(modelo) {
    return MODELOS_PERMITIDOS.includes(String(modelo || ''));
}

function respuestaError(status, mensaje) {
    return {
        status,
        body: {
            error: {
                code: status,
                message: mensaje,
                origen: ORIGEN_PROXY
            }
        }
    };
}

/**
 * Procesa una petición ya parseada: valida modelo y payload, aplica el límite
 * por IP y reenvía a Gemini. Devuelve { status, body }.
 */
export async function manejarPostGemini({ cuerpo, ip, apiKey, fetchImpl } = {}) {
    const modelo = cuerpo && cuerpo.modelo;
    const payload = cuerpo && cuerpo.payload;

    if (!modelo) {
        return respuestaError(400, 'Falta el campo "modelo".');
    }
    if (!esModeloPermitido(modelo)) {
        return respuestaError(400, 'Modelo no permitido. Use uno de: ' + MODELOS_PERMITIDOS.join(', ') + '.');
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return respuestaError(400, 'El campo "payload" debe ser un objeto JSON con la solicitud de Gemini.');
    }
    if (!permitirPeticion(ip)) {
        return respuestaError(429, 'Demasiadas solicitudes. Espere un minuto antes de generar otro plan.');
    }

    const clave = String(apiKey || claveDesdeEntorno() || '').trim();
    if (!clave) {
        return respuestaError(503, 'El servidor no tiene configurada GEMINI_API_KEY. Configure la variable de entorno o use una clave propia en Configuración avanzada.');
    }

    const control = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const temporizador = control ? setTimeout(() => control.abort(), TIEMPO_MAX_GEMINI_MS) : null;
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(modelo) + ':generateContent?key=' + encodeURIComponent(clave);

    try {
        const respuesta = await (fetchImpl || fetch)(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: control ? control.signal : undefined
        });

        let data = null;
        try { data = await respuesta.json(); } catch (e) {
            if (control && control.signal.aborted) {
                return respuestaError(504, 'Gemini no respondió a tiempo. Intente de nuevo más tarde.');
            }
            return respuestaError(502, 'Gemini devolvió una respuesta que no es JSON válido.');
        }

        return { status: Number(respuesta.status) || 502, body: data };
    } catch (error) {
        if (control && control.signal.aborted) {
            return respuestaError(504, 'Gemini no respondió a tiempo. Intente de nuevo más tarde.');
        }
        return respuestaError(502, 'No se pudo conectar con Gemini. Intente de nuevo más tarde.');
    } finally {
        if (temporizador !== null) clearTimeout(temporizador);
    }
}

/** Error de configuración del propio proxy (no de Google). */
export function esErrorDelProxy(data) {
    return !!(data && data.error && data.error.origen === ORIGEN_PROXY);
}
