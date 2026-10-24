// ============================================================================
// Catálogo ICA Équidos - datos embebidos para el PROTOTIPO
// Fuente: Metodología para Evaluar el Bienestar Animal en Équidos - ICA V2.0 (2023)
// ----------------------------------------------------------------------------
//  * 5 Libertades con PESOS FIJOS: 20% / 15% / 30% / 15% / 20%  (suma = 100%)
//  * Capítulo I = 43 indicadores   |  Capítulo II = 32 indicadores
//  * Escala de puntaje permitida: {0, 20, 55, 100}
//  * Clasificación ICA EXCLUSIVA: Excelente >=90 | Alto 75-89 | Medio 50-74 | Bajo <50
//    (NO se usa el semáforo 80/60 de las historias de usuario originales)
// ============================================================================

// --- Las 5 Libertades (pesos fijos de la norma) -----------------------------
const LIBERTADES = [
    { id: 'L1', nombre: 'Hambre, sed y malnutrición',   peso: 0.20 },
    { id: 'L2', nombre: 'Molestias físicas y térmicas', peso: 0.15 },
    { id: 'L3', nombre: 'Dolor, lesión y enfermedad',   peso: 0.30 },
    { id: 'L4', nombre: 'Temor y angustia',             peso: 0.15 },
    { id: 'L5', nombre: 'Comportamiento natural',        peso: 0.20 }
];

// --- Conteo de indicadores por libertad (según la norma) --------------------
// Cap I: 5 + 14 + 16 + 3 + 5 = 43
// Cap II: 5 + 4 + 17 + 3 + 3 = 32
const CONTEO = {
    C1: { L1: 5, L2: 14, L3: 16, L4: 3, L5: 5 },
    C2: { L1: 5, L2: 4,  L3: 17, L4: 3, L5: 3 }
};

// --- Descripciones de referencia por libertad (prototipo) -------------------
const DESC = {
    L1: ['Disponibilidad de agua', 'Calidad del agua', 'Acceso a alimento', 'Cantidad de alimento', 'Frecuencia de alimentación',
         'Estado corporal (BHS)', 'Dieta balanceada', 'Forraje disponible', 'Suplementación', 'Almacenamiento de alimento',
         'Bebederos funcionales', 'Comederos limpios', 'Agua en pastoreo', 'Sales mineralizadas'],
    L2: ['Refugio / sombra', 'Protección contra lluvia', 'Ventilación', 'Temperatura adecuada', 'Superficie de descanso',
         'Cama / cama seca', 'Espacio por animal (Tabla 3)', 'Piso no resbaladizo', 'Drenajes', 'Limpieza de instalaciones',
         'Ausencia de objetos cortopunzantes', 'Área de ejercicio', 'Transporte sin hacinamiento', 'Aperos sin daño',
         'Sombra en potrero', 'Barreras y cercas seguras'],
    L3: ['Inspección sanitaria general', 'Cojera / locomoción', 'Lesiones en piel', 'Heridas abiertas', 'Parásitos externos',
         'Parásitos internos', 'Vacunación vigente', 'Cuidado de cascos', 'Cojinete plantar', 'Ausencia de prácticas dolorosas',
         'No uso de bozal permanente', 'No uso de fusta/espuelas que lesionan', 'Manejo veterinario', 'Medicamentos y tiempos de retiro',
         'Registro de morbilidad', 'Nutrición y enfermedad', 'Lesiones por aperos', 'Atención a heridas'],
    L4: ['Ausencia de miedo al personal', 'Manejo sin violencia', 'Ruidos y sobresaltos', 'Tiempo de descanso',
         'Socialización', 'Respuesta al manejo'],
    L5: ['Expresión de conducta natural', 'Contacto social con otros équidos', 'Libertad de movimiento', 'Ausencia de estereotipias',
         'Acceso a pastoreo', 'Área de socialización', 'Enriquecimiento ambiental']
};

// --- Genera indicadores para un capítulo, asignando libertad y peso ----------
function buildCapitulo(prefix, conteo) {
    const indicadores = [];
    let n = 0;
    LIBERTADES.forEach(lib => {
        const cantidad = conteo[lib.id] || 0;
        for (let i = 0; i < cantidad; i++) {
            n += 1;
            const pool = DESC[lib.id];
            indicadores.push({
                codigo: prefix + '-' + String(n).padStart(2, '0'),
                libertadId: lib.id,
                libertad: lib.nombre,
                pesoLibertad: lib.peso,
                descripcion: pool[i % pool.length]
            });
        }
    });
    return indicadores;
}

// --- Catálogo completo -------------------------------------------------------
const CATALOG = {
    C1: {
        name: 'Capítulo I - Cría, producción, exportación, exhibición y deporte (43 indicadores)',
        indicadores: buildCapitulo('I', CONTEO.C1)
    },
    C2: {
        name: 'Capítulo II - Traspatio y trabajo (32 indicadores)',
        indicadores: buildCapitulo('II', CONTEO.C2)
    }
};

// --- Escala de puntaje permitida por la norma --------------------------------
const SCORES = [0, 20, 55, 100];

// --- Clasificación ICA EXCLUSIVA (Excelente / Alto / Medio / Bajo) -----------
function clasificarICA(puntaje) {
    if (puntaje >= 90) return 'Excelente';
    if (puntaje >= 75) return 'Alto';
    if (puntaje >= 50) return 'Medio';
    return 'Bajo';
}

// Alias por compatibilidad
const clasificar = clasificarICA;

// --- Cálculo de muestra (Tabla 1/4) ------------------------------------------
function calcularMuestra(totalHato) {
    if (totalHato === null || totalHato === undefined || totalHato <= 0) return 0;
    if (totalHato < 10) return totalHato;
    if (totalHato <= 20) return 10;
    if (totalHato <= 99) return 20;
    if (totalHato <= 499) return 30;
    if (totalHato <= 999) return 40;
    return Math.ceil(totalHato * 0.05);
}

// --- Cálculo de resultados por libertad + puntaje global ---------------------
// results: [{ codigo, libertadId, score }]  (score puede ser null si no se respondió)
function calcularResultados(results) {
    const porLibertad = LIBERTADES.map(lib => {
        const items = results.filter(r => r.libertadId === lib.id && r.score !== null && r.score !== undefined);
        const n = items.length;
        const suma = items.reduce((a, r) => a + Number(r.score), 0);
        const promedio = n > 0 ? suma / n : 0;
        const ponderado = (promedio / 100) * lib.peso; // contribución 0..peso
        return {
            libertadId: lib.id,
            nombre: lib.nombre,
            peso: lib.peso,
            evaluados: n,
            promedio: promedio,
            ponderado: ponderado
        };
    });
    const global = porLibertad.reduce((a, l) => a + l.ponderado, 0) * 100; // 0..100
    return {
        porLibertad: porLibertad,
        global: global,
        clasificacion: clasificarICA(global)
    };
}

// --- Utilidades de verificación ---------------------------------------------
function contarIndicadores(cap) {
    return CATALOG[cap].indicadores.length;
}
