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

const MODELOS_VIGENTES = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];

test('la lista blanca del proxy usa exactamente los modelos vigentes y en orden', () => {
    assert.deepEqual([...MODELOS_PERMITIDOS], MODELOS_VIGENTES);
    MODELOS_VIGENTES.forEach(modelo => assert.equal(esModeloPermitido(modelo), true));
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
                message: 'This model models/gemini-3.8-flash is no longer available. Please update your code to use models/gemini-3.8-flash.'
            }
        })
    });

    const resultado = await manejarPostGemini({
        cuerpo: { modelo: 'gemini-3.8-flash', payload: { contents: [] } },
        ip: 'test-404-modelo',
        apiKey: 'clave-de-prueba',
        fetchImpl
    });

    assert.equal(resultado.status, 404);
    assert.equal(resultado.body.error.origen, undefined);
    assert.match(resultado.body.error.message, /no longer available/i);
});

test('un 404 del primer modelo no impide probar los dos siguientes', async () => {
    const source = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
    const modelosSolicitados = [];
    const ctx = vm.createContext({
        console: { info() {}, warn() {}, log() {} },
        document: { addEventListener() {} },
        localStorage: { getItem: () => null, setItem() {} },
        location: { protocol: 'http:' },
        AbortController,
        setTimeout,
        clearTimeout,
        fetch: async (url, opciones) => {
            const modelo = JSON.parse(opciones.body).modelo;
            modelosSolicitados.push(modelo);
            if (modelo === 'gemini-3.8-flash') {
                return {
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                    json: async () => ({ error: { code: 404, message: 'Modelo no disponible para esta clave' } })
                };
            }
            return {
                ok: true,
                status: 200,
                json: async () => ({ candidates: [{ content: { parts: [{ text: '{"resumen":"ok"}' }] } }] })
            };
        }
    });

    vm.runInContext(source, ctx, { filename: 'js/app.js' });
    assert.deepEqual([...vm.runInContext('GEMINI_MODELS', ctx)], MODELOS_VIGENTES);

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
    ctx.toast = () => {};

    const evaluacion = { id: 1, estado: 'FINALIZADA', documental: {}, respuestas: {} };
    await ctx.generarPlanIA(evaluacion, null);

    assert.deepEqual(modelosSolicitados, ['gemini-3.8-flash', 'gemini-2.5-flash']);
    assert.equal(evaluacion.planIA.modelo, 'gemini-2.5-flash');
});
