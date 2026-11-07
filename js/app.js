// ============================================================================
// Lógica SPA — Sistema ICA de Bienestar Animal en Équidos
// Flujo: finca activa → inventario → 4 etapas (EI-EIV) → resultados → plan
// ============================================================================

const STORAGE_KEY = 'ica_equidos_v3';

let state = {
    user: null,
    fincas: [],
    fincaActivaId: null,
    inventario: [],
    evaluaciones: [],
    evalActualId: null
};

/* ------------------------------- Persistencia ---------------------------- */
function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { console.warn(e); }
}
function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try { state = Object.assign(state, JSON.parse(raw)); } catch (e) { console.warn('Estado inválido', e); }
}

/* ------------------------------- Utilidades ------------------------------ */
function escapeHtml(t) {
    if (t === null || t === undefined) return '';
    const d = document.createElement('div');
    d.textContent = String(t);
    return d.innerHTML;
}
function fmtFecha(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }); }
    catch (e) { return iso; }
}
function getFinca(id) { return state.fincas.find(f => f.id === id) || null; }
function getFincaActiva() { return getFinca(state.fincaActivaId); }
function getInventario(fincaId) { return state.inventario.filter(i => i.fincaId === fincaId); }
function totalAnimales(fincaId) { return getInventario(fincaId).reduce((a, i) => a + Number(i.cantidad || 0), 0); }
function getEvalActual() { return state.evaluaciones.find(e => e.id === state.evalActualId) || null; }
function getEvalById(id) { return state.evaluaciones.find(e => e.id === id) || null; }

function toast(msg, type) {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}

/* ------------------------------- Navegación ------------------------------ */
function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen' + name);
    if (el) el.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === name));

    if (name === 'Dashboard') renderDashboard();
    if (name === 'Fincas') renderFincas();
    if (name === 'Inventario') renderInventario();
    if (name === 'NuevaEvaluacion') renderNuevaEvaluacion();
    if (name === 'Evaluacion') renderEvaluacion();
    if (name === 'Historial') renderHistorial();
    if (name === 'PlanMejora') renderPlanMejora();
}

function updateChrome() {
    const logged = !!state.user;
    document.body.classList.toggle('auth', logged);
    document.getElementById('mainNav').style.display = logged ? 'flex' : 'none';
    document.getElementById('userInfo').style.display = logged ? 'flex' : 'none';
    if (logged) document.getElementById('userName').textContent = 'Usuario: ' + state.user.name;

    const chip = document.getElementById('fincaChip');
    const finca = getFincaActiva();
    if (logged && finca) {
        chip.style.display = 'inline-block';
        chip.innerHTML = 'Finca activa: <strong>' + escapeHtml(finca.nombre) + '</strong>';
    } else {
        chip.style.display = 'none';
    }
}

/* ------------------------------- Login ----------------------------------- */
function initLogin() {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value;
        if (!user || !pass) return;
        state.user = { name: user };
        saveState();
        updateChrome();
        showScreen('Dashboard');
        toast('Bienvenido, ' + user);
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        state.user = null;
        saveState();
        updateChrome();
        showScreen('Login');
    });
}

/* ------------------------------- Fincas ---------------------------------- */
function initFincaForm() {
    document.getElementById('fincaForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const finca = {
            id: Date.now(),
            nombre: document.getElementById('f-nombre').value.trim(),
            propietario: document.getElementById('f-propietario').value.trim(),
            departamento: document.getElementById('f-departamento').value.trim(),
            municipio: document.getElementById('f-municipio').value.trim(),
            vereda: document.getElementById('f-vereda').value.trim(),
            lat: document.getElementById('f-lat').value,
            lon: document.getElementById('f-lon').value,
            msnm: document.getElementById('f-msnm').value,
            tipo: document.getElementById('f-tipo').value,
            sistema: document.getElementById('f-sistema').value,
            creada: new Date().toISOString()
        };
        if (!finca.nombre || !finca.propietario || !finca.departamento || !finca.municipio || !finca.msnm) {
            toast('Complete los campos obligatorios', 'error');
            return;
        }
        state.fincas.push(finca);
        // Al crearla, queda seleccionada automáticamente.
        state.fincaActivaId = finca.id;
        saveState();
        e.target.reset();
        renderFincas();
        updateChrome();
        toast('Finca registrada y seleccionada: ' + finca.nombre);
    });
}

function renderFincas() {
    const tbody = document.querySelector('#tblFincas tbody');
    tbody.innerHTML = '';
    if (state.fincas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="muted">Aún no hay fincas registradas.</td></tr>';
        return;
    }
    state.fincas.forEach(f => {
        const activa = f.id === state.fincaActivaId;
        const tr = document.createElement('tr');
        if (activa) tr.className = 'tr-active';
        tr.innerHTML = `
            <td>${escapeHtml(f.nombre)}</td>
            <td>${escapeHtml(f.propietario)}</td>
            <td>${escapeHtml(f.municipio)}, ${escapeHtml(f.departamento)} — ${escapeHtml(f.vereda)}</td>
            <td>${escapeHtml(f.msnm)}</td>
            <td>${escapeHtml(f.tipo)}</td>
            <td>${escapeHtml(f.sistema)}</td>
            <td>${totalAnimales(f.id)}</td>
            <td>${activa
                ? '<span class="badge badge-alto">Activa</span>'
                : `<button class="btn btn-outline btn-sm" data-action="select-finca" data-id="${f.id}" type="button">Seleccionar</button>`}</td>`;
        tbody.appendChild(tr);
    });
}

/* ------------------------------- Inventario ------------------------------ */
function initEquinoForm() {
    document.getElementById('equinoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const finca = getFincaActiva();
        if (!finca) { toast('Seleccione una finca primero', 'error'); return; }
        const cantidad = parseInt(document.getElementById('e-cantidad').value) || 0;
        if (cantidad <= 0) { toast('La cantidad debe ser mayor que cero', 'error'); return; }
        state.inventario.push({
            id: Date.now(),
            fincaId: finca.id,
            especie: document.getElementById('e-especie').value,
            edad: document.getElementById('e-edad').value,
            sexo: document.getElementById('e-sexo').value,
            cantidad,
            identificacion: document.getElementById('e-identificacion').value.trim(),
            ubicacion: document.getElementById('e-ubicacion').value.trim()
        });
        saveState();
        document.getElementById('e-cantidad').value = 1;
        document.getElementById('e-identificacion').value = '';
        renderInventario();
        updateChrome();
        toast('Grupo agregado al inventario');
    });
}

function renderInventario() {
    const finca = getFincaActiva();
    const empty = document.getElementById('invEmpty');
    const content = document.getElementById('invContent');
    const label = document.getElementById('invFincaLabel');

    if (!finca) {
        empty.style.display = 'block';
        content.style.display = 'none';
        label.textContent = '';
        return;
    }
    empty.style.display = 'none';
    content.style.display = 'block';
    label.innerHTML = `Finca activa: <strong>${escapeHtml(finca.nombre)}</strong> · ${escapeHtml(finca.municipio)}, ${escapeHtml(finca.departamento)}`;

    const tbody = document.querySelector('#tblInventario tbody');
    tbody.innerHTML = '';
    const filas = getInventario(finca.id);
    if (filas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="muted">Sin animales registrados. Agregue al menos un grupo.</td></tr>';
    } else {
        filas.forEach(i => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(nombreEspecie(i.especie))}</td>
                <td>${escapeHtml(nombreGrupo(i.edad))}</td>
                <td>${escapeHtml(nombreSexo(i.sexo))}</td>
                <td>${i.cantidad}</td>
                <td>${escapeHtml(i.identificacion) || '—'}</td>
                <td>${escapeHtml(i.ubicacion) || '—'}</td>
                <td><button class="btn btn-danger btn-sm" data-action="del-inv" data-id="${i.id}" type="button">Eliminar</button></td>`;
            tbody.appendChild(tr);
        });
    }
    renderMuestraPanel(finca.id);
}

function renderMuestraPanel(fincaId) {
    const total = totalAnimales(fincaId);
    const muestra = calcularMuestra(total);
    const row = muestraRow(total);

    document.getElementById('sampleResumen').innerHTML =
        `Tamaño del predio: <strong>${total}</strong> équidos → Muestra mínima: <strong>${muestra}</strong>`;

    const tbody = document.querySelector('#tblMuestra tbody');
    tbody.innerHTML = '';
    SAMPLE_TABLE.forEach(r => {
        const tr = document.createElement('tr');
        if (row && row.rango === r.rango) tr.className = 'tr-active';
        tr.innerHTML = `<td>${r.rango}</td><td>${r.muestra}</td>`;
        tbody.appendChild(tr);
    });
}

function nombreEspecie(id) { const e = ESPECIES.find(x => x.id === id); return e ? e.nombre : id; }
function nombreGrupo(id) { const g = GRUPOS_ETARIOS.find(x => x.id === id); return g ? g.nombre : id; }
function nombreSexo(id) { const s = SEXOS.find(x => x.id === id); return s ? s.nombre : id; }

/* ------------------------------- Nueva evaluación ------------------------ */
function renderNuevaEvaluacion() {
    const finca = getFincaActiva();
    const empty = document.getElementById('neEmpty');
    const content = document.getElementById('neContent');

    if (!finca) {
        content.style.display = 'none';
        empty.style.display = 'block';
        empty.innerHTML = `<p>No hay una finca activa. Registre o seleccione una finca para iniciar la evaluación.</p>
            <button class="btn btn-primary" data-screen="Fincas" type="button">Ir a Fincas</button>`;
        return;
    }
    empty.style.display = 'none';
    content.style.display = 'block';

    document.getElementById('neFincaResumen').innerHTML = `
        <div class="item"><span>Finca</span><strong>${escapeHtml(finca.nombre)}</strong></div>
        <div class="item"><span>Propietario</span><strong>${escapeHtml(finca.propietario)}</strong></div>
        <div class="item"><span>Ubicación</span><strong>${escapeHtml(finca.municipio)}, ${escapeHtml(finca.departamento)}</strong></div>
        <div class="item"><span>Vereda</span><strong>${escapeHtml(finca.vereda)}</strong></div>
        <div class="item"><span>Altitud</span><strong>${escapeHtml(finca.msnm)} msnm</strong></div>
        <div class="item"><span>Tipo / sistema</span><strong>${escapeHtml(finca.tipo)} · ${escapeHtml(finca.sistema)}</strong></div>`;

    const total = totalAnimales(finca.id);
    const muestra = calcularMuestra(total);
    const info = document.getElementById('neMuestraInfo');
    if (total === 0) {
        info.innerHTML = '<strong>Sin inventario.</strong> Registre los équidos de la finca antes de evaluar.';
        info.style.borderLeftColor = 'var(--danger)';
    } else {
        info.innerHTML = `Tamaño del predio: <strong>${total}</strong> équidos · Muestra mínima (Tabla 1): <strong>${muestra}</strong>.
            <br><span class="muted">La muestra se confirma y distribuye en la Etapa I.</span>`;
        info.style.borderLeftColor = 'var(--ica-verde)';
    }
}

function initNuevaEvaluacion() {
    document.getElementById('nuevaEvalForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const finca = getFincaActiva();
        if (!finca) { toast('Seleccione una finca', 'error'); return; }
        const total = totalAnimales(finca.id);
        if (total === 0) { toast('Registre el inventario antes de evaluar', 'error'); return; }

        const ev = {
            id: Date.now(),
            fincaId: finca.id,
            capitulo: document.getElementById('evalCapitulo').value,
            fechaCreacion: new Date().toISOString(),
            etapaActual: 'EI',
            estado: 'EN_PROCESO',
            suspension: null,
            muestra: {
                total,
                calculada: calcularMuestra(total),
                ajustada: calcularMuestra(total),
                justificacion: '',
                ubicaciones: []
            },
            respuestas: {},
            documental: {},
            plan: {},
            resultados: null
        };
        state.evaluaciones.push(ev);
        state.evalActualId = ev.id;
        saveState();
        showScreen('Evaluacion');
        toast('Evaluación iniciada — Etapa I');
    });
}

/* ------------------------------- Evaluación ------------------------------ */
function renderEvaluacion() {
    const ev = getEvalActual();
    const stepper = document.getElementById('stepper');
    const header = document.getElementById('evalHeader');
    const body = document.getElementById('evalBody');

    if (!ev) {
        stepper.innerHTML = '';
        header.innerHTML = '';
        body.innerHTML = `<div class="card empty">
            <p>No hay una evaluación en curso.</p>
            <button class="btn btn-primary" data-screen="NuevaEvaluacion" type="button">Crear evaluación</button>
        </div>`;
        return;
    }

    renderStepper(ev);
    renderEvalHeader(ev);

    if (ev.estado === 'SUSPENDIDA') {
        body.innerHTML = `
            <div class="banner-suspended">
                <strong>Evaluación suspendida.</strong><br>
                Motivo: ${escapeHtml(ev.suspension && ev.suspension.motivo ? ev.suspension.motivo : 'No especificado')}
                ${ev.suspension ? '<br><span class="muted">' + fmtFecha(ev.suspension.fecha) + '</span>' : ''}
            </div>
            <div class="card">
                <p class="muted">La evaluación quedó en pausa durante la Etapa II. Puede reanudarla cuando el predio cumpla las condiciones.</p>
                <div class="actions">
                    <button class="btn btn-primary" data-action="reactivar" type="button">Reanudar evaluación</button>
                    <button class="btn btn-outline" data-screen="Historial" type="button">Ir al historial</button>
                </div>
            </div>`;
        return;
    }

    if (ev.etapaActual === 'EI') body.innerHTML = htmlEtapaI(ev);
    if (ev.etapaActual === 'EII') body.innerHTML = htmlEtapaII(ev);
    if (ev.etapaActual === 'EIII') body.innerHTML = htmlEtapaIII(ev);
    if (ev.etapaActual === 'EIV') body.innerHTML = htmlEtapaIV(ev);
}

function renderStepper(ev) {
    const idx = ETAPAS.findIndex(e => e.id === ev.etapaActual);
    document.getElementById('stepper').innerHTML = ETAPAS.map((e, i) => {
        let cls = 'step';
        if (ev.estado === 'FINALIZADA' || i < idx) cls += ' done';
        if (i === idx && ev.estado !== 'FINALIZADA') cls += ' active';
        return `<div class="${cls}">
            <span class="step-num">${e.num}</span>
            <span class="step-name">${e.nombre}</span>
        </div>`;
    }).join('');
}

function renderEvalHeader(ev) {
    const finca = getFinca(ev.fincaId);
    const badge = ev.estado === 'FINALIZADA' ? 'badge-excelente'
        : ev.estado === 'SUSPENDIDA' ? 'badge-bajo' : 'badge-suave';
    document.getElementById('evalHeader').innerHTML = `
        <div class="eval-header">
            <div>
                <div class="eval-title">${finca ? escapeHtml(finca.nombre) : 'Finca'} — ${ev.capitulo === 'C1' ? 'Capítulo I' : 'Capítulo II'}</div>
                <div class="eval-sub">${finca ? escapeHtml(finca.propietario) + ' · ' + escapeHtml(finca.municipio) + ', ' + escapeHtml(finca.departamento) + ' · ' + escapeHtml(finca.msnm) + ' msnm' : ''}</div>
            </div>
            <div>
                <span class="badge ${badge}">${ev.estado.replace('_', ' ')}</span>
                <span class="eval-sub"> · Iniciada ${fmtFecha(ev.fechaCreacion)}</span>
            </div>
        </div>`;
}

/* ------------------------------- Etapa I --------------------------------- */
function htmlEtapaI(ev) {
    const finca = getFinca(ev.fincaId);
    const total = ev.muestra.total;
    const row = muestraRow(total);
    const filas = SAMPLE_TABLE.map(r =>
        `<tr class="${row && row.rango === r.rango ? 'tr-active' : ''}"><td>${r.rango}</td><td>${r.muestra}</td></tr>`
    ).join('');

    const chips = ev.muestra.ubicaciones.length
        ? ev.muestra.ubicaciones.map((u, i) =>
            `<span class="finca-chip">${escapeHtml(u)}
             <button class="btn btn-sm btn-outline" data-action="del-ubicacion" data-idx="${i}" type="button" style="margin-left:.35rem;">×</button>
             </span>`).join(' ')
        : '<span class="muted">Aún no ha agregado potreros o corrales.</span>';

    return `
    <div class="card">
        <h2>Etapa I — Reunión inicial</h2>
        <p class="muted">${ETAPAS[0].desc}</p>

        <h3>Información básica del predio</h3>
        <div class="finca-resumen">
            <div class="item"><span>Finca</span><strong>${escapeHtml(finca.nombre)}</strong></div>
            <div class="item"><span>Propietario</span><strong>${escapeHtml(finca.propietario)}</strong></div>
            <div class="item"><span>Departamento / municipio</span><strong>${escapeHtml(finca.departamento)} / ${escapeHtml(finca.municipio)}</strong></div>
            <div class="item"><span>Vereda</span><strong>${escapeHtml(finca.vereda)}</strong></div>
            <div class="item"><span>Coordenadas</span><strong>${escapeHtml(finca.lat) || '—'}, ${escapeHtml(finca.lon) || '—'}</strong></div>
            <div class="item"><span>Altitud</span><strong>${escapeHtml(finca.msnm)} msnm</strong></div>
            <div class="item"><span>Tipo de predio</span><strong>${escapeHtml(finca.tipo)}</strong></div>
            <div class="item"><span>Sistema productivo</span><strong>${escapeHtml(finca.sistema)}</strong></div>
        </div>

        <h3 style="margin-top:1.25rem;">Tamaño del predio y cálculo de la muestra</h3>
        <div class="info-box">
            Total de équidos en la finca: <strong>${total}</strong> ·
            Muestra mínima calculada: <strong>${ev.muestra.calculada}</strong> ·
            Rango aplicado: <strong>${row ? row.rango : '—'}</strong>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="ei-muestra">Muestra ajustada (si aplica justificación técnica)</label>
                <input type="number" id="ei-muestra" min="1" max="${total}" value="${ev.muestra.ajustada}">
            </div>
            <div class="form-group">
                <label for="ei-just">Justificación del ajuste</label>
                <input type="text" id="ei-just" value="${escapeHtml(ev.muestra.justificacion)}" placeholder="Opcional">
            </div>
        </div>

        <p class="hint">Tabla 1 — Tamaño mínimo de muestra (Capítulo I). La muestra se distribuye proporcionalmente entre los grupos etarios.</p>
        <div class="table-wrap">
            <table class="table table-compact">
                <thead><tr><th>N.º de équidos en la finca</th><th>Muestra mínima</th></tr></thead>
                <tbody>${filas}</tbody>
            </table>
        </div>

        <h3 style="margin-top:1.25rem;">Selección de potreros y corrales a evaluar</h3>
        <div class="form-inline" style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem;">
            <input type="text" id="ei-ubicacion" placeholder="Ej.: Potrero 2, Corral 1, Pesebrera A" style="max-width:340px;">
            <button class="btn btn-outline" data-action="add-ubicacion" type="button">Agregar</button>
        </div>
        <div id="ei-ubicaciones">${chips}</div>

        <div class="actions">
            <button class="btn btn-primary" data-action="save-ei" type="button">Finalizar Etapa I y continuar</button>
        </div>
    </div>`;
}

/* ------------------------------- Etapa II -------------------------------- */
function htmlEtapaII(ev) {
    const cap = CATALOG[ev.capitulo];
    return `
    <div class="card">
        <h2>Etapa II — Inspección de campo</h2>
        <p class="muted">${ETAPAS[1].desc}</p>
        <div id="eii-indicadores">${renderIndicadores(ev, cap, 'campo')}</div>
        <div class="actions">
            <button class="btn btn-secondary" data-action="back-ei" type="button">← Etapa I</button>
            <button class="btn btn-primary" data-action="save-eii" type="button">Guardar y continuar a Etapa III</button>
            <button class="btn btn-danger" data-action="suspender" type="button">Suspender evaluación</button>
        </div>
    </div>`;
}

function escalaChips(score) {
    return ESCALA_INDICADOR.map(e =>
        `<span class="score-chip sc-${e.score}${String(score) === String(e.score) ? ' sel' : ''}">${e.score} · ${e.etiqueta}</span>`
    ).join('');
}

function renderIndicadores(ev, cap, fase, exclude) {
    let html = '';
    const ex = exclude || [];
    LIBERTADES.forEach(lib => {
        const inds = cap.indicadores.filter(i => i.libertadId === lib.id && (!fase || i.fase === fase) && ex.indexOf(i.codigo) < 0);
        if (inds.length === 0) return;
        html += `<div class="libertad-section">
            <h4>
                <span>${lib.id} · ${escapeHtml(lib.nombre)}</span>
                <span class="libertad-meta">
                    <span class="libertad-count">${inds.length} indicadores</span>
                    <span class="peso-badge">Peso ${(lib.peso * 100).toFixed(0)}%</span>
                </span>
            </h4>`;
        inds.forEach(ind => {
            const r = ev.respuestas[ind.codigo] || {};
            const doc = fase === 'documental' ? DOCUMENTOS.find(d => d.indicador === ind.descripcion) : null;
            const opts = ESCALA_INDICADOR.map(e =>
                `<option value="${e.score}" ${String(r.score) === String(e.score) ? 'selected' : ''}>${e.score} — ${e.etiqueta}</option>`).join('');
            const preguntas = (ind.preguntas || []).map(q => `<li>${escapeHtml(q)}</li>`).join('');
            const metodoCls = ind.metodo === 'Documental' ? 'doc' : 'vis';
            html += `<article class="indicator-card" data-codigo="${ind.codigo}">
                <div class="indicator-head">
                    <div class="indicator-title">
                        <span class="indicator-codigo">${ind.codigo}</span>
                        <span class="indicator-desc">${escapeHtml(ind.descripcion)}</span>
                    </div>
                    <span class="badge badge-metodo ${metodoCls}">${ind.metodo}</span>
                </div>

                <dl class="indicator-meta">
                    <dt>Metodología de evaluación</dt>
                    <dd>${escapeHtml(ind.metodologia)}</dd>
                    <dt>Preguntas para evaluar el indicador</dt>
                    <dd><ul class="indicator-questions">${preguntas}</ul></dd>
                </dl>

                ${doc ? `<div class="indicator-doc">
                    Documento asociado: <strong>${doc.id}</strong> — ${escapeHtml(doc.nombre)}
                    <span class="muted">El puntaje se deriva del estado del documento.</span>
                </div>` : ''}

                <div class="indicator-bottom">
                    <div class="indicator-scale">
                        <span class="scale-label">Escala de calificación</span>
                        <div class="score-chips">${escalaChips(r.score)}</div>
                    </div>
                    <div class="indicator-controls">
                        <label for="score-${ind.codigo}">Puntaje del indicador</label>
                        <select class="score-select" id="score-${ind.codigo}" data-codigo="${ind.codigo}" ${doc ? 'disabled' : ''}>
                            <option value="">— Sin calificar —</option>${opts}
                        </select>
                        <label class="chk">
                            <input type="checkbox" class="req-trat" data-codigo="${ind.codigo}" ${r.trat ? 'checked' : ''}>
                            Requiere tratamiento
                        </label>
                    </div>
                </div>
            </article>`;
        });
        html += '</div>';
    });
    return html;
}

function marcarEscala(card, value) {
    if (!card) return;
    card.querySelectorAll('.score-chip').forEach(chip => {
        chip.classList.toggle('sel', chip.classList.contains('sc-' + value));
    });
}

function sincronizarDocumento(sel) {
    const ev = getEvalActual();
    if (!ev) return;
    const doc = DOCUMENTOS.find(d => d.id === sel.dataset.doc);
    if (!doc) return;
    const ind = getIndicadorByDesc(ev.capitulo, doc.indicador);
    if (!ind) return;

    const card = document.querySelector('.indicator-card[data-codigo="' + ind.codigo + '"]');
    const scoreSel = card ? card.querySelector('.score-select') : null;
    let score = null;
    if (sel.value === 'niega') {
        score = 0;
    } else if (sel.value === 'presenta') {
        const actual = scoreSel && scoreSel.value !== '' ? parseInt(scoreSel.value, 10) : null;
        score = (actual === null || actual === 0) ? 100 : actual;
    }
    if (score !== null && scoreSel) {
        scoreSel.value = String(score);
        marcarEscala(card, score);
    }
    const row = sel.closest('tr');
    if (row) {
        const cell = row.querySelector('td:last-child strong');
        if (cell) cell.textContent = score === null ? '—' : score;
    }
}

/* ------------------------------- Etapa III ------------------------------- */
function htmlEtapaIII(ev) {
    const cap = CATALOG[ev.capitulo];
    const filas = DOCUMENTOS.map(doc => {
        const d = ev.documental[doc.id] || {};
        const mapped = getIndicadorByDesc(ev.capitulo, doc.indicador);
        const score = mapped && ev.respuestas[mapped.codigo] ? ev.respuestas[mapped.codigo].score : null;
        const sel = (v) => d.estado === v ? 'selected' : '';
        return `<tr class="doc-row" data-doc="${doc.id}">
            <td>
                <div class="doc-name">${escapeHtml(doc.nombre)}</div>
                <div class="doc-mapped">Indicador asociado: ${mapped ? mapped.codigo + ' — ' + escapeHtml(doc.indicador) : 'no aplica en este capítulo'}</div>
            </td>
            <td>
                <select class="doc-estado" data-doc="${doc.id}">
                    <option value="">—</option>
                    <option value="presenta" ${sel('presenta')}>Presenta</option>
                    <option value="niega" ${sel('niega')}>Se niega</option>
                    <option value="na" ${sel('na')}>No aplica</option>
                </select>
            </td>
            <td style="text-align:center;">
                <input type="checkbox" class="doc-firmado" data-doc="${doc.id}" ${d.firmado ? 'checked' : ''}>
            </td>
            <td><input type="text" class="doc-matricula" data-doc="${doc.id}" value="${escapeHtml(d.matricula || '')}" placeholder="MV / MVZ · COMVEZCOL"></td>
            <td><input type="text" class="doc-obs" data-doc="${doc.id}" value="${escapeHtml(d.obs || '')}" placeholder="Observación"></td>
            <td><strong>${score !== null && score !== undefined ? score : '—'}</strong></td>
        </tr>`;
    }).join('');

    const nDoc = cap.indicadores.filter(i => i.fase === 'documental').length;

    return `
    <div class="card">
        <h2>Etapa III — Revisión documental</h2>
        <p class="muted">${ETAPAS[2].desc}</p>
        <div class="table-wrap">
            <table class="table">
                <thead>
                    <tr>
                        <th>Documento / registro</th><th>Estado</th><th>Firmado</th>
                        <th>Matrícula profesional</th><th>Observación</th><th>Puntaje</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>
        </div>
        <p class="hint">Si el documento “se niega”, el indicador asociado se califica con 0 y se marca como hallazgo, conforme a la norma ICA.</p>

        <h3 style="margin-top:1.25rem;">Indicadores documentales (${nDoc})</h3>
        <p class="muted">Cada ficha presenta la metodología, las preguntas, el método documental y la escala de calificación.</p>
        ${renderIndicadores(ev, cap, 'documental')}

        <div class="actions">
            <button class="btn btn-secondary" data-action="back-eii" type="button">← Etapa II</button>
            <button class="btn btn-primary" data-action="save-eiii" type="button">Guardar y continuar a Etapa IV</button>
        </div>
    </div>`;
}

/* ------------------------------- Etapa IV -------------------------------- */
function htmlEtapaIV(ev) {
    const res = calcularResultadosDe(ev);
    ev.resultados = res;

    const filasLib = res.porLibertad.map(l => `
        <tr>
            <td>${escapeHtml(l.nombre)}</td>
            <td>${(l.peso * 100).toFixed(0)}%</td>
            <td>${l.evaluados}</td>
            <td>${l.promedio.toFixed(2)}</td>
            <td>${l.ponderado.toFixed(4)}</td>
        </tr>`).join('');

    const cap = CATALOG[ev.capitulo];
    const filasInd = cap.indicadores.map(ind => {
        const r = ev.respuestas[ind.codigo] || {};
        const score = (r.score === undefined || r.score === null) ? '—' : r.score;
        return `<tr>
            <td>${ind.codigo}</td>
            <td>${escapeHtml(ind.libertad)}</td>
            <td>${escapeHtml(ind.descripcion)}</td>
            <td>${score}</td>
            <td>${r.trat ? 'Sí' : '—'}</td>
        </tr>`;
    }).join('');

    const filasDoc = DOCUMENTOS.map(d => {
        const x = ev.documental[d.id];
        if (!x) return '';
        return `<tr><td>${escapeHtml(d.nombre)}</td><td>${x.estado === 'presenta' ? 'Presenta' : x.estado === 'niega' ? 'Se niega' : 'No aplica'}</td><td>${x.firmado ? 'Sí' : 'No'}</td></tr>`;
    }).join('');

    const badge = 'badge-' + res.clasificacion.toLowerCase();
    const finalizada = ev.estado === 'FINALIZADA';

    return `
    <div id="acta">
      <div class="card">
        <h2>Etapa IV — Entrega de resultados</h2>
        <p class="muted">${ETAPAS[3].desc}</p>

        <div class="result-summary">
            <div>
                <div class="result-label">Puntaje final del predio</div>
                <div class="big-score">${res.global.toFixed(2)}<small> %</small></div>
            </div>
            <div>
                <div class="result-label">Clasificación ICA</div>
                <span class="badge ${badge}" style="font-size:1.05rem;">${res.clasificacion}</span>
            </div>
        </div>

        ${escalaHtml(res.global)}

        <h3>Resultados por libertad</h3>
        <div class="table-wrap">
            <table class="table">
                <thead><tr><th>Libertad</th><th>Peso</th><th>Indicadores evaluados</th><th>Promedio</th><th>Ponderado</th></tr></thead>
                <tbody>${filasLib}</tbody>
            </table>
        </div>

        <h3 style="margin-top:1.25rem;">Indicadores del predio</h3>
        <div class="table-wrap">
            <table class="table table-compact">
                <thead><tr><th>Código</th><th>Libertad</th><th>Indicador</th><th>Puntaje</th><th>Tratamiento</th></tr></thead>
                <tbody>${filasInd}</tbody>
            </table>
        </div>

        ${filasDoc ? `<h3 style="margin-top:1.25rem;">Revisión documental</h3>
        <div class="table-wrap">
            <table class="table table-compact">
                <thead><tr><th>Documento</th><th>Estado</th><th>Firmado</th></tr></thead>
                <tbody>${filasDoc}</tbody>
            </table>
        </div>` : ''}

        <p class="hint">Escala ICA: Bajo &lt; 50 % · Medio 50–74 % · Alto 75–89 % · Excelente ≥ 90 %.</p>
      </div>
    </div>

    <div class="actions">
        <button class="btn btn-secondary" data-action="back-eiii" type="button">← Etapa III</button>
        ${finalizada
            ? '<span class="badge badge-excelente">Evaluación finalizada</span>'
            : '<button class="btn btn-primary" data-action="finalizar" type="button">Finalizar evaluación</button>'}
        <button class="btn btn-outline" data-action="pdf-acta" type="button">Descargar acta (PDF)</button>
        <button class="btn btn-outline" data-screen="NuevaEvaluacion" type="button">Nueva evaluación</button>
    </div>`;
}

function escalaHtml(pct) {
    const p = Math.max(0, Math.min(100, pct));
    return `
    <div class="scale-wrap">
        <div class="scale">
            <div class="scale-seg seg-bajo" style="width:50%">Bajo &lt;50</div>
            <div class="scale-seg seg-medio" style="width:25%">Medio 50–74</div>
            <div class="scale-seg seg-alto" style="width:15%">Alto 75–89</div>
            <div class="scale-seg seg-excelente" style="width:10%">Excelente ≥90</div>
        </div>
        <div class="scale-marker" style="left:${p}%" data-value="${p.toFixed(1)}%"></div>
    </div>`;
}

function calcularResultadosDe(ev) {
    const cap = CATALOG[ev.capitulo];
    const results = cap.indicadores.map(i => ({
        libertadId: i.libertadId,
        score: ev.respuestas[i.codigo] ? ev.respuestas[i.codigo].score : null
    }));
    return calcularResultados(results);
}

/* ------------------------------- Historial ------------------------------- */
function renderHistorial() {
    const tbody = document.querySelector('#tblHistorial tbody');
    tbody.innerHTML = '';
    if (state.evaluaciones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="muted">Aún no hay evaluaciones.</td></tr>';
        return;
    }
    state.evaluaciones.slice().reverse().forEach(ev => {
        const finca = getFinca(ev.fincaId);
        const res = ev.resultados || (ev.etapaActual === 'EIV' ? calcularResultadosDe(ev) : null);
        const pct = res ? res.global.toFixed(2) + ' %' : '—';
        const clas = res ? `<span class="badge badge-${res.clasificacion.toLowerCase()}">${res.clasificacion}</span>` : '—';
        const estadoCls = ev.estado === 'FINALIZADA' ? 'badge-excelente' : ev.estado === 'SUSPENDIDA' ? 'badge-bajo' : 'badge-suave';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${finca ? escapeHtml(finca.nombre) : '—'}</td>
            <td>${ev.capitulo === 'C1' ? 'Capítulo I' : 'Capítulo II'}</td>
            <td>${fmtFecha(ev.fechaCreacion)}</td>
            <td>${ev.etapaActual}</td>
            <td><span class="badge ${estadoCls}">${ev.estado.replace('_', ' ')}</span></td>
            <td>${pct}</td>
            <td>${clas}</td>
            <td><button class="btn btn-outline btn-sm" data-action="ver-eval" data-id="${ev.id}" type="button">Ver</button></td>`;
        tbody.appendChild(tr);
    });
}

/* ------------------------------- Plan de mejora -------------------------- */
function renderPlanMejora() {
    const content = document.getElementById('planMejoraContent');
    const evals = state.evaluaciones.filter(e => e.estado === 'FINALIZADA' || e.resultados || e.etapaActual === 'EIV');
    if (evals.length === 0) {
        content.innerHTML = '<p class="muted">Aún no hay evaluaciones finalizadas para generar el plan de mejora.</p>';
        return;
    }
    let html = '';
    evals.slice().reverse().forEach(ev => {
        const finca = getFinca(ev.fincaId);
        const cap = CATALOG[ev.capitulo];
        const res = ev.resultados || calcularResultadosDe(ev);
        const hallazgos = cap.indicadores.filter(i => {
            const r = ev.respuestas[i.codigo];
            return r && (r.trat || (r.score !== null && r.score !== undefined && r.score < 100));
        });
        let filas = hallazgos.map(i => {
            const r = ev.respuestas[i.codigo];
            const prioridad = r.trat ? 'Alta' : (r.score <= 20 ? 'Media' : 'Baja');
            const plan = (ev.plan && ev.plan[i.codigo]) || {};
            return `<tr>
                <td>${i.codigo}</td>
                <td>${escapeHtml(i.libertad)}</td>
                <td>${r.score}</td>
                <td>${prioridad}</td>
                <td><input type="text" data-plan="accion" data-eval="${ev.id}" data-codigo="${i.codigo}" value="${escapeHtml(plan.accion || '')}" placeholder="Acción correctiva"></td>
                <td><input type="text" data-plan="responsable" data-eval="${ev.id}" data-codigo="${i.codigo}" value="${escapeHtml(plan.responsable || '')}" placeholder="Responsable"></td>
                <td><input type="date" data-plan="fecha" data-eval="${ev.id}" data-codigo="${i.codigo}" value="${escapeHtml(plan.fecha || '')}"></td>
            </tr>`;
        }).join('');

        html += `<div class="plan-item">
            <h4>${finca ? escapeHtml(finca.nombre) : 'Finca'} — ${ev.capitulo === 'C1' ? 'Capítulo I' : 'Capítulo II'}</h4>
            <p class="muted">Clasificación: <strong>${res.clasificacion}</strong> · Puntaje: ${res.global.toFixed(2)} %</p>`;
        html += hallazgos.length
            ? `<div class="table-wrap"><table class="table table-compact">
                <thead><tr><th>Ind.</th><th>Libertad</th><th>Puntaje</th><th>Prioridad</th><th>Acción</th><th>Responsable</th><th>Fecha límite</th></tr></thead>
                <tbody>${filas}</tbody></table></div>`
            : '<p>Todos los indicadores obtuvieron 100. No hay hallazgos.</p>';
        html += '</div>';
    });
    content.innerHTML = html;
}

/* ------------------------------- PDF ------------------------------------- */
function exportPdf(element, filename) {
    if (!element) return;
    if (window.html2pdf) {
        html2pdf().set({
            margin: 0.5,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }).from(element).save();
    } else {
        window.print();
    }
}

/* ------------------------------- Dashboard ------------------------------- */
function renderDashboard() {
    const finca = getFincaActiva();
    document.getElementById('dashFincas').textContent = state.fincas.length;
    document.getElementById('dashAnimales').textContent = finca ? totalAnimales(finca.id) : 0;
    document.getElementById('dashEvaluaciones').textContent = state.evaluaciones.length;
    document.getElementById('dashFincaLabel').textContent = finca
        ? `Finca activa: ${finca.nombre} · ${finca.municipio}, ${finca.departamento}`
        : 'No hay finca activa. Seleccione una en el módulo Fincas.';

    const finalizadas = state.evaluaciones.filter(e => e.resultados);
    const ultima = finalizadas[finalizadas.length - 1];
    document.getElementById('dashClasificacion').textContent = ultima ? ultima.resultados.clasificacion : '—';

    const tbody = document.querySelector('#tblDashEvals tbody');
    tbody.innerHTML = '';
    if (state.evaluaciones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="muted">Aún no hay evaluaciones registradas.</td></tr>';
        return;
    }
    state.evaluaciones.slice().reverse().slice(0, 8).forEach(ev => {
        const f = getFinca(ev.fincaId);
        const res = ev.resultados;
        const estadoCls = ev.estado === 'FINALIZADA' ? 'badge-excelente' : ev.estado === 'SUSPENDIDA' ? 'badge-bajo' : 'badge-suave';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${f ? escapeHtml(f.nombre) : '—'}</td>
            <td>${ev.capitulo === 'C1' ? 'I' : 'II'}</td>
            <td>${fmtFecha(ev.fechaCreacion)}</td>
            <td>${ev.etapaActual}</td>
            <td><span class="badge ${estadoCls}">${ev.estado.replace('_', ' ')}</span></td>
            <td>${res ? res.global.toFixed(2) + ' %' : '—'}</td>
            <td>${res ? `<span class="badge badge-${res.clasificacion.toLowerCase()}">${res.clasificacion}</span>` : '—'}</td>`;
        tbody.appendChild(tr);
    });
}

/* ------------------------------- Acciones -------------------------------- */
function capturarRespuestas(ev) {
    document.querySelectorAll('.score-select').forEach(sel => {
        const cod = sel.dataset.codigo;
        const cur = ev.respuestas[cod] || {};
        cur.score = sel.value === '' ? null : parseInt(sel.value, 10);
        const chk = document.querySelector('.req-trat[data-codigo="' + cod + '"]');
        cur.trat = chk ? chk.checked : !!cur.trat;
        ev.respuestas[cod] = cur;
    });
}

function capturarDocumental(ev) {
    const cap = CATALOG[ev.capitulo];
    document.querySelectorAll('.doc-estado').forEach(sel => {
        const id = sel.dataset.doc;
        const doc = DOCUMENTOS.find(d => d.id === id);
        if (!doc) return;
        const firmado = document.querySelector('.doc-firmado[data-doc="' + id + '"]');
        const matricula = document.querySelector('.doc-matricula[data-doc="' + id + '"]');
        const obs = document.querySelector('.doc-obs[data-doc="' + id + '"]');
        const item = {
            estado: sel.value,
            firmado: firmado ? firmado.checked : false,
            matricula: matricula ? matricula.value.trim() : '',
            obs: obs ? obs.value.trim() : ''
        };
        ev.documental[id] = item;

        const ind = cap.indicadores.find(i => i.descripcion === doc.indicador);
        if (!ind) return;
        const cur = ev.respuestas[ind.codigo] || { score: null, trat: false };
        if (item.estado === 'niega') {
            cur.score = 0;
            cur.trat = true;
        } else if (item.estado === 'presenta') {
            if (cur.score === null || cur.score === undefined || cur.score === 0) cur.score = 100;
        }
        ev.respuestas[ind.codigo] = cur;
    });
}

function contarRespondidos(ev) {
    const cap = CATALOG[ev.capitulo];
    return cap.indicadores.filter(i => {
        const r = ev.respuestas[i.codigo];
        return r && r.score !== null && r.score !== undefined;
    }).length;
}

function manejarAccion(action, el) {
    const ev = getEvalActual();

    switch (action) {
        case 'select-finca': {
            const id = Number(el.dataset.id);
            state.fincaActivaId = id;
            saveState();
            renderFincas();
            updateChrome();
            const f = getFinca(id);
            toast('Finca activa: ' + (f ? f.nombre : ''));
            break;
        }
        case 'del-inv': {
            const id = Number(el.dataset.id);
            state.inventario = state.inventario.filter(i => i.id !== id);
            saveState();
            renderInventario();
            updateChrome();
            break;
        }
        case 'add-ubicacion': {
            if (!ev) return;
            const input = document.getElementById('ei-ubicacion');
            const val = input.value.trim();
            if (!val) return;
            ev.muestra.ubicaciones.push(val);
            saveState();
            renderEvaluacion();
            break;
        }
        case 'del-ubicacion': {
            if (!ev) return;
            ev.muestra.ubicaciones.splice(Number(el.dataset.idx), 1);
            saveState();
            renderEvaluacion();
            break;
        }
        case 'save-ei': {
            if (!ev) return;
            const m = document.getElementById('ei-muestra');
            const j = document.getElementById('ei-just');
            ev.muestra.ajustada = Math.max(1, Math.min(ev.muestra.total, parseInt(m.value, 10) || ev.muestra.calculada));
            ev.muestra.justificacion = j.value.trim();
            if (ev.muestra.ubicaciones.length === 0) {
                toast('Seleccione al menos un potrero o corral', 'error');
                return;
            }
            ev.etapaActual = 'EII';
            saveState();
            renderEvaluacion();
            toast('Etapa I finalizada');
            break;
        }
        case 'save-eii': {
            if (!ev) return;
            capturarRespuestas(ev);
            const total = CATALOG[ev.capitulo].indicadores.filter(i => i.fase === 'campo').length;
            const resp = Object.keys(ev.respuestas).filter(c => ev.respuestas[c].score !== null && ev.respuestas[c].score !== undefined).length;
            if (resp < total) {
                if (!confirm('Ha calificado ' + resp + ' de ' + total + ' indicadores de campo. ¿Desea continuar de todos modos?')) return;
            }
            ev.etapaActual = 'EIII';
            saveState();
            renderEvaluacion();
            toast('Etapa II guardada');
            break;
        }
        case 'suspender': {
            if (!ev) return;
            const motivo = prompt('Motivo de la suspensión de la evaluación:');
            if (motivo === null) return;
            if (!motivo.trim()) { toast('Indique el motivo', 'error'); return; }
            capturarRespuestas(ev);
            ev.estado = 'SUSPENDIDA';
            ev.suspension = { motivo: motivo.trim(), fecha: new Date().toISOString() };
            saveState();
            renderEvaluacion();
            toast('Evaluación suspendida', 'error');
            break;
        }
        case 'reactivar': {
            if (!ev) return;
            ev.estado = 'EN_PROCESO';
            ev.suspension = null;
            saveState();
            renderEvaluacion();
            toast('Evaluación reanudada');
            break;
        }
        case 'save-eiii': {
            if (!ev) return;
            capturarRespuestas(ev);
            capturarDocumental(ev);
            ev.etapaActual = 'EIV';
            ev.resultados = calcularResultadosDe(ev);
            saveState();
            renderEvaluacion();
            toast('Etapa III guardada');
            break;
        }
        case 'finalizar': {
            if (!ev) return;
            ev.resultados = calcularResultadosDe(ev);
            const faltan = CATALOG[ev.capitulo].indicadores.length - contarRespondidos(ev);
            if (faltan > 0) {
                if (!confirm('Faltan ' + faltan + ' indicadores por calificar. La clasificación podría no ser válida. ¿Finalizar de todos modos?')) return;
            }
            ev.estado = 'FINALIZADA';
            ev.fechaCierre = new Date().toISOString();
            saveState();
            renderEvaluacion();
            toast('Evaluación finalizada: ' + ev.resultados.clasificacion);
            break;
        }
        case 'back-ei': {
            if (!ev) return;
            ev.etapaActual = 'EI';
            saveState();
            renderEvaluacion();
            break;
        }
        case 'back-eii': {
            if (!ev) return;
            ev.etapaActual = 'EII';
            saveState();
            renderEvaluacion();
            break;
        }
        case 'back-eiii': {
            if (!ev) return;
            ev.etapaActual = 'EIII';
            saveState();
            renderEvaluacion();
            break;
        }
        case 'ver-eval': {
            state.evalActualId = Number(el.dataset.id);
            saveState();
            showScreen('Evaluacion');
            break;
        }
        case 'pdf-acta': {
            exportPdf(document.getElementById('acta'), 'acta_evaluacion_ica.pdf');
            break;
        }
    }
}

/* ------------------------------- Init ------------------------------------ */
function init() {
    loadState();

    initLogin();
    initFincaForm();
    initEquinoForm();
    initNuevaEvaluacion();

    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        exportPdf(document.getElementById('planMejoraContent'), 'plan_mejora_ica.pdf');
    });

    // Delegación de clics: navegación + acciones
    document.addEventListener('click', (e) => {
        const nav = e.target.closest('[data-screen]');
        if (nav && !nav.dataset.action) {
            showScreen(nav.dataset.screen);
            return;
        }
        const act = e.target.closest('[data-action]');
        if (act) {
            e.preventDefault();
            manejarAccion(act.dataset.action, act);
        }
    });

    document.addEventListener('change', (e) => {
        // Persistencia del plan de mejora
        const inp = e.target.closest('[data-plan]');
        if (inp) {
            const ev = getEvalById(Number(inp.dataset.eval));
            if (!ev) return;
            ev.plan = ev.plan || {};
            const cod = inp.dataset.codigo;
            ev.plan[cod] = ev.plan[cod] || {};
            ev.plan[cod][inp.dataset.plan] = inp.value;
            saveState();
            return;
        }

        // Resaltar la escala del indicador al cambiar el puntaje
        const scoreSel = e.target.closest('.score-select');
        if (scoreSel) {
            marcarEscala(scoreSel.closest('.indicator-card'), scoreSel.value);
            return;
        }

        // Sincronizar el indicador documental con el estado del documento
        const docSel = e.target.closest('.doc-estado');
        if (docSel) sincronizarDocumento(docSel);
    });

    updateChrome();
    if (state.user) showScreen('Dashboard');
    else showScreen('Login');
}

document.addEventListener('DOMContentLoaded', init);
