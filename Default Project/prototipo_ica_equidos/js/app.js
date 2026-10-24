// ============================================================================
// Lógica SPA - Prototipo Sistema ICA Équidos
// Alineado a la norma ICA V2.0 2023 (pesos por libertad, clasificación exclusiva)
// ============================================================================
let state = {
    user: null,
    predios: [],
    equinos: [],
    evaluaciones: [],
    currentEval: null
};

// ------------------------------- Persistencia ------------------------------
function saveState() {
    localStorage.setItem('ica_equidos_state', JSON.stringify(state));
}
function loadState() {
    const saved = localStorage.getItem('ica_equidos_state');
    if (saved) {
        try { state = JSON.parse(saved); } catch (e) { console.error('Error loading state:', e); }
    }
}

// ------------------------------- Navegación --------------------------------
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById('screen' + screenName);
    if (screen) screen.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screenName);
    });
    // Re-render dinámico al navegar
    if (screenName === 'Dashboard') updateDashboard();
    if (screenName === 'Predios') { renderPredios(); populatePredioSelects(); }
    if (screenName === 'Inventario') { renderEquinos(); populateEquinoSelects(); updateSampleCalc(); }
    if (screenName === 'Resultados') renderResultados();
    if (screenName === 'PlanMejora') renderPlanMejora();
    if (screenName === 'EvaluacionEtapas') renderEvalEtapas();
}

// ------------------------------- Utilidades --------------------------------
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function getPredio(id) { return state.predios.find(p => p.id == id); }
function getEquino(id) { return state.equinos.find(e => e.id == id); }

// ------------------------------- Login -------------------------------------
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (username && password) {
            state.user = { name: username };
            saveState();
            updateUserInfo();
            showScreen('Dashboard');
        }
    });
}
function initLogout() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        state.user = null;
        saveState();
        updateUserInfo();
        showScreen('Login');
    });
}
function updateUserInfo() {
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    if (state.user) {
        userInfo.style.display = 'flex';
        userName.textContent = 'Usuario: ' + state.user.name;
    } else {
        userInfo.style.display = 'none';
    }
}

// ------------------------------- Predios -----------------------------------
function initPredios() {
    const predioForm = document.getElementById('predioForm');
    predioForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('predioNombre').value.trim();
        const ubicacion = document.getElementById('predioUbicacion').value.trim();
        if (!nombre) return;
        state.predios.push({ id: Date.now(), nombre, ubicacion });
        saveState();
        predioForm.reset();
        renderPredios();
        populatePredioSelects();
    });
    renderPredios();
    populatePredioSelects();
}
function renderPredios() {
    const tbody = document.getElementById('prediosTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    state.predios.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${escapeHtml(p.nombre)}</td><td>${escapeHtml(p.ubicacion)}</td>`;
        tbody.appendChild(tr);
    });
}
function populatePredioSelects() {
    ['equinoPredio', 'evalPredio'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        sel.innerHTML = '';
        state.predios.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.nombre;
            sel.appendChild(opt);
        });
    });
}

// ------------------------------- Inventario --------------------------------
function initInventario() {
    document.getElementById('equinoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const predioId = parseInt(document.getElementById('equinoPredio').value);
        const especie = document.getElementById('equinoEspecie').value;
        const edad = document.getElementById('equinoEdad').value;
        const sexo = document.getElementById('equinoSexo').value;
        const nombre = document.getElementById('equinoNombre').value;
        const totalHato = parseInt(document.getElementById('equinoTotal').value) || 0;
        state.equinos.push({ id: Date.now(), predioId, especie, edad, sexo, nombre, totalHato });
        saveState();
        e.target.reset();
        renderEquinos();
        populateEquinoSelects();
        updateSampleCalc();
    });
    document.getElementById('equinoTotal').addEventListener('input', updateSampleCalc);
    renderEquinos();
    populateEquinoSelects();
    updateSampleCalc();
}
function renderEquinos() {
    const tbody = document.getElementById('equinosTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    state.equinos.forEach(eq => {
        const predio = getPredio(eq.predioId);
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${predio ? escapeHtml(predio.nombre) : eq.predioId}</td>
                        <td>${escapeHtml(eq.especie)}</td>
                        <td>${escapeHtml(eq.edad)}</td>
                        <td>${escapeHtml(eq.sexo)}</td>
                        <td>${escapeHtml(eq.nombre)}</td>
                        <td>${eq.totalHato}</td>`;
        tbody.appendChild(tr);
    });
}
function updateSampleCalc() {
    const el = document.getElementById('sampleResult');
    if (!el) return;
    const total = parseInt(document.getElementById('equinoTotal').value) || 0;
    el.textContent = `Total hato: ${total} → Muestra sugerida: ${calcularMuestra(total)}`;
}
function populateEquinoSelects() {
    const sel = document.getElementById('evalEquino');
    if (!sel) return;
    sel.innerHTML = '';
    state.equinos.forEach(eq => {
        const predio = getPredio(eq.predioId);
        const opt = document.createElement('option');
        opt.value = eq.id;
        opt.textContent = (predio ? predio.nombre + ' - ' : '') + (eq.nombre || (eq.especie + ' ' + eq.sexo));
        sel.appendChild(opt);
    });
}

// ------------------------------- Nueva evaluación --------------------------
function initNuevaEvaluacion() {
    document.getElementById('nuevaEvalForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const predioId = parseInt(document.getElementById('evalPredio').value);
        const equinoId = parseInt(document.getElementById('evalEquino').value);
        const capitulo = document.getElementById('evalCapitulo').value;
        const etapa = document.getElementById('evalEtapa').value;
        state.currentEval = { predioId, equinoId, capitulo, etapa, respuestas: {} };
        saveState();
        showScreen('EvaluacionEtapas');
        renderEvalEtapas();
    });
}

// ------------------------------- Evaluación --------------------------------
function initEvalEtapas() {
    document.getElementById('saveEvalBtn').addEventListener('click', saveEvaluation);
    document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);
}

function renderEvalEtapas() {
    const ctx = document.getElementById('evalContext');
    const list = document.getElementById('indicatorsList');
    if (!list) return;
    if (!state.currentEval) {
        ctx.textContent = 'No hay evaluación en curso. Cree una nueva evaluación.';
        list.innerHTML = '';
        return;
    }
    const ev = state.currentEval;
    const predio = getPredio(ev.predioId);
    const equino = getEquino(ev.equinoId);
    const cap = CATALOG[ev.capitulo];
    ctx.innerHTML = `<strong>Predio:</strong> ${predio ? escapeHtml(predio.nombre) : '-'} ·
                     <strong>Animal:</strong> ${equino ? escapeHtml(equino.nombre || equino.especie) : '-'} ·
                     <strong>Capítulo:</strong> ${ev.capitulo} · <strong>Etapa:</strong> ${ev.etapa}<br>
                     <em>${cap.name}</em>`;

    list.innerHTML = '';
    LIBERTADES.forEach(lib => {
        const indicadores = cap.indicadores.filter(i => i.libertadId === lib.id);
        if (indicadores.length === 0) return;
        const section = document.createElement('div');
        section.className = 'libertad-section';
        section.innerHTML = `<h3>${lib.id} · ${escapeHtml(lib.nombre)} <span class="peso-badge">Peso ${(lib.peso * 100).toFixed(0)}%</span></h3>`;
        indicadores.forEach(ind => {
            const prev = ev.respuestas[ind.codigo] || {};
            const div = document.createElement('div');
            div.className = 'indicator-item';
            div.innerHTML = `
                <div class="indicator-info">
                    <div class="indicator-codigo">${ind.codigo}</div>
                    <div class="indicator-desc">${escapeHtml(ind.descripcion)}</div>
                </div>
                <div class="indicator-controls">
                    <label>Puntaje</label>
                    <select class="score-select" data-codigo="${ind.codigo}" data-libertad="${ind.libertadId}">
                        <option value="">—</option>
                        ${SCORES.map(s => `<option value="${s}" ${prev.score === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                    <label class="chk"><input type="checkbox" class="req-trat" data-codigo="${ind.codigo}" ${prev.trat ? 'checked' : ''}> Requiere tratamiento</label>
                </div>`;
            section.appendChild(div);
        });
        list.appendChild(section);
    });
}

function handlePhotoUpload(e) {
    const files = e.target.files;
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = '';
    if (files.length > 3) {
        alert('Máximo 3 fotos permitidas (norma/HU-06).');
        e.target.value = '';
        return;
    }
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = document.createElement('img');
            img.src = ev.target.result;
            img.className = 'photo-thumb';
            img.title = files[i].name;
            preview.appendChild(img);
        };
        reader.readAsDataURL(files[i]);
    }
    e.target.dataset.count = files.length;
}

function saveEvaluation() {
    if (!state.currentEval) { alert('No hay evaluación en curso'); return; }
    const ev = state.currentEval;
    const cap = CATALOG[ev.capitulo];
    const results = [];
    const respuestas = {};
    let respondidos = 0;

    document.querySelectorAll('.indicator-item').forEach(item => {
        const sel = item.querySelector('.score-select');
        const chk = item.querySelector('.req-trat');
        const codigo = sel.dataset.codigo;
        const libertadId = sel.dataset.libertad;
        const score = sel.value === '' ? null : parseInt(sel.value);
        const trat = chk.checked;
        if (score !== null) respondidos++;
        respuestas[codigo] = { score, trat };
        results.push({ codigo, libertadId, score, requiere_tratamiento: trat });
    });

    const calc = calcularResultados(results);
    const totalIndicadores = cap.indicadores.length;
    if (respondidos < totalIndicadores) {
        if (!confirm(`Ha respondido ${respondidos} de ${totalIndicadores} indicadores. ¿Desea guardar de todos modos?`)) return;
    }

    const photos = [];
    document.querySelectorAll('.photo-thumb').forEach(img => photos.push(img.src));

    const evalObj = {
        id: Date.now(),
        predioId: ev.predioId,
        equinoId: ev.equinoId,
        capitulo: ev.capitulo,
        etapa: ev.etapa,
        results,
        respuestas,
        photos,
        porLibertad: calc.porLibertad,
        global: calc.global,
        clasificacion: calc.clasificacion,
        fecha: new Date().toISOString()
    };
    state.evaluaciones.push(evalObj);
    saveState();
    alert('Evaluación guardada. Puntaje global: ' + calc.global.toFixed(2) + '% · Clasificación ICA: ' + calc.clasificacion);
    showScreen('Resultados');
}

// ------------------------------- Resultados --------------------------------
function renderResultados() {
    const content = document.getElementById('resultadosContent');
    if (!content) return;
    content.innerHTML = '';
    if (state.evaluaciones.length === 0) {
        content.innerHTML = '<p>No hay evaluaciones registradas.</p>';
        return;
    }
    state.evaluaciones.slice().reverse().forEach(ev => {
        const predio = getPredio(ev.predioId);
        const equino = getEquino(ev.equinoId);
        const div = document.createElement('div');
        div.className = 'result-item';
        let filas = '';
        (ev.porLibertad || []).forEach(l => {
            filas += `<tr>
                <td>${escapeHtml(l.nombre)}</td>
                <td>${(l.peso * 100).toFixed(0)}%</td>
                <td>${l.evaluados}</td>
                <td>${l.promedio.toFixed(2)}</td>
                <td>${l.ponderado.toFixed(4)}</td>
            </tr>`;
        });
        div.innerHTML = `
            <h3>Evaluación ${ev.id} — ${predio ? escapeHtml(predio.nombre) : ''}</h3>
            <p><strong>Animal:</strong> ${equino ? escapeHtml(equino.nombre || equino.especie) : '-'} ·
               <strong>Capítulo:</strong> ${ev.capitulo} · <strong>Etapa:</strong> ${ev.etapa}</p>
            <table class="table">
                <thead><tr><th>Libertad</th><th>Peso</th><th>Ind. evaluados</th><th>Promedio</th><th>Ponderado</th></tr></thead>
                <tbody>${filas}</tbody>
            </table>
            <p class="global-score">Puntaje global: <strong>${ev.global.toFixed(2)}%</strong> —
               Clasificación ICA: <span class="badge badge-${(ev.clasificacion || '').toLowerCase()}">${ev.clasificacion}</span></p>`;
        content.appendChild(div);
    });
}

// ------------------------------- Plan de mejora ----------------------------
function initPlanMejora() {
    document.getElementById('exportPdfBtn').addEventListener('click', exportPdf);
    renderPlanMejora();
}
function renderPlanMejora() {
    const content = document.getElementById('planMejoraContent');
    if (!content) return;
    content.innerHTML = '';
    if (state.evaluaciones.length === 0) {
        content.innerHTML = '<p>No hay evaluaciones para generar plan de mejora.</p>';
        return;
    }
    state.evaluaciones.slice().reverse().forEach(ev => {
        const predio = getPredio(ev.predioId);
        const equino = getEquino(ev.equinoId);
        const hallazgos = (ev.results || []).filter(r => r.requiere_tratamiento || (r.score !== null && r.score < 100));
        const div = document.createElement('div');
        div.className = 'plan-item';
        let filas = '';
        hallazgos.forEach(r => {
            const lib = LIBERTADES.find(l => l.id === r.libertadId);
            const prioridad = r.requiere_tratamiento ? 'Alta' : (r.score <= 20 ? 'Media' : 'Baja');
            filas += `<tr>
                <td>${r.codigo}</td>
                <td>${escapeHtml(lib ? lib.nombre : '')}</td>
                <td>${r.score !== null ? r.score : 'N/A'}</td>
                <td>${prioridad}</td>
                <td><input type="text" placeholder="Acción correctiva"></td>
                <td><input type="text" placeholder="Responsable"></td>
                <td><input type="date"></td>
            </tr>`;
        });
        div.innerHTML = `<h3>Eval ${ev.id} — ${predio ? escapeHtml(predio.nombre) : ''} / ${equino ? escapeHtml(equino.nombre || equino.especie) : ''}</h3>
            <p>Clasificación ICA: <strong>${ev.clasificacion || '-'}</strong> · Puntaje: ${ev.global ? ev.global.toFixed(2) : '-'}%</p>`;
        if (hallazgos.length === 0) {
            div.innerHTML += '<p>Sin hallazgos: todos los indicadores obtuvieron 100.</p>';
        } else {
            div.innerHTML += `<table class="table">
                <thead><tr><th>Ind.</th><th>Libertad</th><th>Puntaje</th><th>Prioridad</th><th>Acción</th><th>Responsable</th><th>Fecha límite</th></tr></thead>
                <tbody>${filas}</tbody></table>`;
        }
        content.appendChild(div);
    });
}
function exportPdf() {
    const element = document.getElementById('planMejoraContent');
    const opt = {
        margin: 0.5,
        filename: 'plan_mejora_ica_equidos.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    if (window.html2pdf) {
        html2pdf().set(opt).from(element).save();
    } else {
        window.print();
    }
}

// ------------------------------- Dashboard ---------------------------------
function updateDashboard() {
    const p = document.getElementById('dashPredios');
    const e = document.getElementById('dashEquinos');
    const v = document.getElementById('dashEvaluaciones');
    if (p) p.textContent = state.predios.length;
    if (e) e.textContent = state.equinos.length;
    if (v) v.textContent = state.evaluaciones.length;
}

// ------------------------------- Init --------------------------------------
function init() {
    loadState();
    initLogin();
    initLogout();
    document.addEventListener('click', (e) => {
        if (e.target.classList && e.target.classList.contains('nav-btn') && e.target.dataset.screen) {
            showScreen(e.target.dataset.screen);
        }
    });
    initPredios();
    initInventario();
    initNuevaEvaluacion();
    initEvalEtapas();
    initPlanMejora();
    updateUserInfo();
    if (state.user) showScreen('Dashboard');
    else showScreen('Login');
}
document.addEventListener('DOMContentLoaded', init);
