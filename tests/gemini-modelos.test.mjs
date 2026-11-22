import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

import {
    MODELOS_PERMITIDOS,
    esModeloPermitido,
    manejarPostGemini,
    reiniciarLimitePeticiones
} from '../server/gemini-core.mjs';

const MODELOS_VIGENTES = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-flash'];
const sourceApp = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');

function respuestaOk() {
    return {
        ok: true,
        status: 200,
        json: async () => ({ candidates: [{ content: { parts: [{ text: '{"resumen":"ok"}' }] } }] })
    };
}

function respuestaError(modelo, status, mensaje) {
    return {
        ok: false,
        status,
        statusText: status === 404 ? 'Not Found' : 'Error',
        json: async () => ({ error: { code: status, message: mensaje } })
    };
}

function crearContextoApp(fetchImpl, avisos = []) {
    const ctx = vm.createContext({
        console: { info() {}, warn() {}, log() {} },
        document: { addEventListener() {} },
        localStorage: { getItem: () => null, setItem() {} },
        location: { protocol: 'http:' },
        AbortController,
        setTimeout,
        clearTimeout,
        fetch: fetchImpl
    });

    vm.runInContext(sourceApp, ctx, { filename: 'js/app.js' });

    // Se sustituyen las piezas de UI/persistencia; se conserva la lógica de reintento.
    ctx.getGeminiApiKey = () => '';
    ctx.setBotonIAEstado = () => {};
    ctx.iniciarContadorIA = () => {};
    ctx.detenerContadorIA = () => {};
    ctx.construirDatosEvaluacionIA = () => ({});
    ctx.construirPromptIA = () => 'prueba';
    ctx.parsearPlanIA = () => ({ resumen: 'ok', hallazgos: [], documentos: [] });
    ctx.filtrarHallazgosIA = hallazgos => hallazgos;
    ctx.filtrarDocumentosIA = documentos => documentos;
    ctx.saveState = () => {};
    ctx.showScreen = () => {};
    ctx.toast = mensaje => avisos.push(String(mensaje));
    return ctx;
}

test('la lista blanca del proxy usa exactamente los modelos vigentes y en orden', () => {
    assert.deepEqual([...MODELOS_PERMITIDOS], MODELOS_VIGENTES);
    MODELOS_VIGENTES.forEach(modelo => assert.equal(esModeloPermitido(modelo), true));
    assert.equal(esModeloPermitido('gemini-2.5-flash'), false);
    assert.equal(esModeloPermitido('gemini-2.0-flash'), false);
});

test('el proxy reenvía un 404 de Google sin convertirlo en error propio', async () => {
    reiniciarLimitePeticiones();
    const fetchImpl = async () => ({
        status: 404,
        json: async () => ({
            error: {
                code: 404,
                status: 'NOT_FOUND',
                message: 'This model models/gemini-3.5-flash-lite is no longer available to new users.'
            }
        })
    });

    const resultado = await manejarPostGemini({
        cuerpo: { modelo: 'gemini-3.5-flash-lite', payload: { contents: [] } },
        ip: 'test-404-modelo',
        apiKey: 'clave-de-prueba',
        fetchImpl
    });

    assert.equal(resultado.status, 404);
    assert.equal(resultado.body.error.origen, undefined);
    assert.match(resultado.body.error.message, /no longer available/i);
});

test('un 404 del primer modelo no impide probar los dos siguientes', async () => {
    const modelosSolicitados = [];
    const ctx = crearContextoApp(async (url, opciones) => {
        const modelo = JSON.parse(opciones.body).modelo;
        modelosSolicitados.push(modelo);
        return modelo === 'gemini-3.5-flash'
            ? respuestaError(modelo, 404, 'Modelo no disponible para esta clave')
            : respuestaOk();
    });

    assert.deepEqual([...vm.runInContext('GEMINI_MODELS', ctx)], MODELOS_VIGENTES);

    const evaluacion = { id: 1, estado: 'FINALIZADA', documental: {}, respuestas: {} };
    await ctx.generarPlanIA(evaluacion, null);

    assert.deepEqual(modelosSolicitados, ['gemini-3.5-flash', 'gemini-3.5-flash-lite']);
    assert.equal(evaluacion.planIA.modelo, 'gemini-3.5-flash-lite');
});

test('si todos fallan, el mensaje conserva el primer error HTTP real', async () => {
    const avisos = [];
    const modelosSolicitados = [];
    const ctx = crearContextoApp(async (url, opciones) => {
        const modelo = JSON.parse(opciones.body).modelo;
        modelosSolicitados.push(modelo);
        if (modelo === 'gemini-3.5-flash') {
            return respuestaError(modelo, 403, 'Permiso denegado para este modelo');
        }
        return respuestaError(modelo, 404, 'Modelo no disponible para esta clave');
    }, avisos);

    const evaluacion = { id: 2, estado: 'FINALIZADA', documental: {}, respuestas: {} };
    await ctx.generarPlanIA(evaluacion, null);

    assert.deepEqual(modelosSolicitados, MODELOS_VIGENTES);
    assert.equal(evaluacion.planIA, undefined);
    const mensaje = avisos.join(' | ');
    assert.match(mensaje, /Primer error detectado/);
    assert.match(mensaje, /HTTP 403/);
    assert.match(mensaje, /Permiso denegado para este modelo/);
    assert.match(mensaje, /HTTP 404/);
});
