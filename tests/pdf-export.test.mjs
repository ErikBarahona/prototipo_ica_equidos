import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

test('exportPdf captura desde el origen, usa modo avoid-all y restaura el DOM', async () => {
    const source = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
    const scrollLlamadas = [];
    const clases = new Set();
    const captura = {};
    const barra = { style: { display: '' }, dataset: {} };
    const element = {
        querySelectorAll: () => [barra],
        classList: {
            add: clase => clases.add(clase),
            remove: clase => clases.delete(clase)
        }
    };

    const html2pdf = () => ({
        set(opciones) { captura.opciones = opciones; return this; },
        from(nodo) {
            captura.nodo = nodo;
            captura.clases = [...clases];
            captura.scroll = [...scrollLlamadas];
            captura.barraDisplay = barra.style.display;
            return this;
        },
        save() { return Promise.resolve(); }
    });

    const ctx = vm.createContext({
        console: { warn() {}, log() {} },
        document: { addEventListener() {} },
        localStorage: { getItem: () => null, setItem() {} },
        location: { protocol: 'http:' },
        html2pdf,
        toast() {},
        window: {
            scrollX: 120,
            scrollY: 800,
            scrollTo: (x, y) => scrollLlamadas.push([x, y]),
            html2pdf
        }
    });

    vm.runInContext(source, ctx, { filename: 'js/app.js' });
    ctx.exportPdf(element, 'acta_evaluacion_ica.pdf');
    await new Promise(resolve => process.nextTick(resolve));

    assert.equal(captura.nodo, element);
    assert.deepEqual(captura.scroll, [[0, 0]]);
    assert.deepEqual(captura.clases, ['pdf-export']);
    assert.equal(captura.barraDisplay, 'none');
    assert.deepEqual(scrollLlamadas, [[0, 0], [120, 800]]);

    assert.deepEqual(captura.opciones.html2canvas.scrollX, 0);
    assert.deepEqual(captura.opciones.html2canvas.scrollY, 0);
    assert.deepEqual([...captura.opciones.pagebreak.mode], ['avoid-all', 'css', 'legacy']);
    assert.equal(captura.opciones.pagebreak.avoid.includes('.card'), false);
    assert.equal(captura.opciones.pagebreak.avoid.includes('.plan-ia-seccion'), false);

    assert.equal(clases.has('pdf-export'), false);
    assert.equal(barra.style.display, '');
    assert.equal(Object.prototype.hasOwnProperty.call(barra.dataset, 'pdfDisplay'), false);
});
