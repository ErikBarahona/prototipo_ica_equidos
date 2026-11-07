// ============================================================================
// Catálogo y reglas — Sistema ICA de Bienestar Animal en Équidos
// Fuente: Metodología ICA V2.0 (2023)
//  * 5 libertades con pesos fijos 20 / 15 / 30 / 15 / 20  (suma 100 %)
//  * Capítulo I = 43 indicadores · Capítulo II = 32 indicadores
//  * Escala de puntaje: 0 / 20 / 55 / 100
//  * Clasificación: Excelente >=90 · Alto 75-89 · Medio 50-74 · Bajo <50
// ============================================================================

const NORM = {
    version: 'ICA V2.0 (2023)',
    nombre: 'Metodología para Evaluar el Bienestar Animal en Équidos'
};

// --- Las 5 libertades y sus pesos fijos -------------------------------------
const LIBERTADES = [
    { id: 'L1', nombre: 'Hambre, sed y malnutrición',   peso: 0.20 },
    { id: 'L2', nombre: 'Molestias físicas y térmicas', peso: 0.15 },
    { id: 'L3', nombre: 'Dolor, lesión y enfermedad',   peso: 0.30 },
    { id: 'L4', nombre: 'Temor y angustia',             peso: 0.15 },
    { id: 'L5', nombre: 'Comportamiento natural',        peso: 0.20 }
];

// --- Conteo de indicadores por libertad -------------------------------------
const CONTEO = {
    C1: { L1: 5, L2: 14, L3: 16, L4: 3, L5: 5 },   // 43
    C2: { L1: 5, L2: 4,  L3: 17, L4: 3, L5: 3 }    // 32
};

// --- Descripciones de referencia -------------------------------------------
const DESC = {
    L1: ['Disponibilidad de agua', 'Calidad del agua', 'Acceso a alimento', 'Cantidad de alimento',
         'Frecuencia de alimentación', 'Estado corporal (BHS)', 'Dieta balanceada', 'Forraje disponible',
         'Suplementación', 'Almacenamiento de alimento', 'Bebederos funcionales', 'Comederos limpios',
         'Agua en pastoreo', 'Sales mineralizadas'],
    L2: ['Refugio / sombra', 'Protección contra lluvia', 'Ventilación', 'Temperatura adecuada',
         'Superficie de descanso', 'Cama seca', 'Espacio por animal (Tabla 3)', 'Piso no resbaladizo',
         'Drenajes', 'Limpieza de instalaciones', 'Ausencia de objetos cortopunzantes', 'Área de ejercicio',
         'Transporte sin hacinamiento', 'Aperos sin daño', 'Sombra en potrero', 'Barreras y cercas seguras'],
    L3: ['Inspección sanitaria general', 'Cojera / locomoción', 'Lesiones en piel', 'Heridas abiertas',
         'Parásitos externos', 'Parásitos internos', 'Vacunación vigente', 'Cuidado de cascos',
         'Cojinete plantar', 'Ausencia de prácticas dolorosas', 'No uso de bozal permanente',
         'No uso de fusta/espuelas que lesionan', 'Manejo veterinario', 'Medicamentos y tiempos de retiro',
         'Registro de morbilidad', 'Nutrición y enfermedad', 'Lesiones por aperos', 'Atención a heridas'],
    L4: ['Ausencia de miedo al personal', 'Manejo sin violencia', 'Ruidos y sobresaltos',
         'Tiempo de descanso', 'Socialización', 'Respuesta al manejo'],
    L5: ['Expresión de conducta natural', 'Contacto social con otros équidos', 'Libertad de movimiento',
         'Ausencia de estereotipias', 'Acceso a pastoreo', 'Área de socialización',
         'Enriquecimiento ambiental']
};

// Índices (0-based) que se verifican en la Etapa III (documental).
const FASE_DOCUMENTAL = {
    L1: [1],                 // Calidad del agua (análisis de laboratorio)
    L2: [12],                // Transporte sin hacinamiento (guía de movilización)
    L3: [5, 6, 12, 13, 14],  // desparasitación, vacunación, manejo veterinario, medicamentos, morbilidad
    L4: [],
    L5: []
};

// --- Etapas de la visita ----------------------------------------------------
const ETAPAS = [
    { id: 'EI',   num: 'Etapa I',   nombre: 'Reunión inicial',
      desc: 'Se obtiene la información básica del predio y se realiza el cálculo del tamaño de muestra y la selección de potreros y corrales a evaluar.' },
    { id: 'EII',  num: 'Etapa II',  nombre: 'Inspección de campo',
      desc: 'Se revisan los espacios destinados al alojamiento de los animales, los recursos ofertados, el estado general de los animales y las instalaciones, indicador por indicador. Si no se cumple con las indicaciones, el evaluador puede suspender la evaluación.' },
    { id: 'EIII', num: 'Etapa III', nombre: 'Revisión documental',
      desc: 'Los dueños del predio deben ofrecer la documentación y los registros necesarios para la evaluación.' },
    { id: 'EIV',  num: 'Etapa IV',  nombre: 'Entrega de resultados',
      desc: 'Cálculo de resultados, clasificación final del predio y entrega por parte del evaluador.' }
];

// --- Tabla 1: tamaño mínimo de muestra (Capítulo I) -------------------------
const SAMPLE_TABLE = [
    { rango: 'Menos de 10', min: 1,    max: 9,        muestra: 'Todos los animales', tipo: 'todos' },
    { rango: '11 – 20',     min: 11,   max: 20,       muestra: '10',                 tipo: 'fijo', valor: 10 },
    { rango: '21 – 99',     min: 21,   max: 99,       muestra: '20',                 tipo: 'fijo', valor: 20 },
    { rango: '100 – 499',   min: 100,  max: 499,      muestra: '30',                 tipo: 'fijo', valor: 30 },
    { rango: '500 – 999',   min: 500,  max: 999,      muestra: '40',                 tipo: 'fijo', valor: 40 },
    { rango: '1.000 o más', min: 1000, max: Infinity, muestra: '5 % del total',      tipo: 'pct',  valor: 0.05 }
];

// --- Documentos de la Etapa III (mapeados a un indicador) -------------------
const DOCUMENTOS = [
    { id: 'D1', nombre: 'Certificado o registro de vacunación',                         indicador: 'Vacunación vigente' },
    { id: 'D2', nombre: 'Registro de tratamientos veterinarios y tiempos de retiro',     indicador: 'Medicamentos y tiempos de retiro' },
    { id: 'D3', nombre: 'Historias clínicas y registro de morbilidad',                    indicador: 'Registro de morbilidad' },
    { id: 'D4', nombre: 'Registro de desparasitación',                                   indicador: 'Parásitos internos' },
    { id: 'D5', nombre: 'Análisis de calidad del agua',                                   indicador: 'Calidad del agua' },
    { id: 'D6', nombre: 'Protocolo de manejo y bienestar / plan de contingencia',        indicador: 'Manejo veterinario' },
    { id: 'D7', nombre: 'Guía de movilización y registro de transporte',                 indicador: 'Transporte sin hacinamiento' }
];

// --- Catálogos simples ------------------------------------------------------
const ESPECIES = [
    { id: 'caballar',  nombre: 'Caballar' },
    { id: 'asnal',     nombre: 'Asnal' },
    { id: 'mular',     nombre: 'Mular' },
    { id: 'burdegano', nombre: 'Burdégano' },
    { id: 'cebroide',  nombre: 'Cebroide' }
];
const GRUPOS_ETARIOS = [
    { id: 'cria',    nombre: 'Cría lactante' },
    { id: 'joven',   nombre: 'Joven' },
    { id: 'adulto',  nombre: 'Adulto' },
    { id: 'geronte', nombre: 'Geronte' }
];
const SEXOS = [
    { id: 'macho',         nombre: 'Macho' },
    { id: 'hembra',        nombre: 'Hembra' },
    { id: 'indeterminado', nombre: 'Indeterminado' }
];

// --- Escala de puntaje ------------------------------------------------------
const SCORES = [0, 20, 55, 100];

// Escala de calificación del indicador, relacionada con la clasificación
// final Excelente → Bajo. Se conservan los cuatro valores de la norma.
const ESCALA_INDICADOR = [
    { score: 100, etiqueta: 'Excelente', clasificacion: 'Excelente', desc: 'Cumple plenamente el indicador' },
    { score: 55,  etiqueta: 'Medio',     clasificacion: 'Medio',     desc: 'Cumple parcialmente el indicador' },
    { score: 20,  etiqueta: 'Bajo',      clasificacion: 'Bajo',      desc: 'Cumple mínimamente el indicador' },
    { score: 0,   etiqueta: 'Bajo (no cumple)', clasificacion: 'Bajo', desc: 'No cumple / situación crítica' }
];

function etiquetaEscala(score) {
    const e = ESCALA_INDICADOR.find(x => String(x.score) === String(score));
    return e ? e.etiqueta : 'Sin calificar';
}

// --- Ficha normativa de cada indicador -------------------------------------
// Metodología y preguntas de referencia para la Etapa II (campo) y la
// Etapa III (documental). El método se deriva de la fase del indicador.
const GUIA = (() => {
    const g = (metodologia, ...preguntas) => ({ metodologia, preguntas });
    return {
        // Libertad 1 — Hambre, sed y malnutrición
        'Disponibilidad de agua': g(
            'Observación directa de bebederos, fuentes y conducta de bebida del grupo muestreado, en al menos dos momentos del día.',
            '¿Todos los équidos tienen acceso permanente a agua limpia y fresca?',
            '¿Los bebederos o fuentes son suficientes y están bien ubicados para todo el grupo?'),
        'Calidad del agua': g(
            'Verificación visual del agua y revisión documental del análisis de laboratorio vigente (pH, sólidos, coliformes).',
            '¿El agua está limpia, sin olores, coloración ni residuos visibles?',
            '¿Se cuenta con un análisis de calidad del agua vigente y firmado?'),
        'Acceso a alimento': g(
            'Observación de comederos, pasturas y rutas de acceso; verificación de que ningún animal queda excluido.',
            '¿Todos los animales pueden acceder al alimento sin competencia ni bloqueos?',
            '¿La ubicación y el número de comederos permiten el acceso de todo el grupo?'),
        'Cantidad de alimento': g(
            'Estimación de la ración ofrecida frente a los requerimientos del grupo y observación del consumo y la saciedad.',
            '¿La cantidad de alimento ofrecida cubre los requerimientos del grupo?',
            '¿Se observan signos de competencia, ansiedad o alimento insuficiente?'),
        'Frecuencia de alimentación': g(
            'Entrevista al personal y revisión del registro o programación de alimentación, contrastados con la observación en campo.',
            '¿La frecuencia de alimentación es constante y adecuada a la especie y categoría?',
            '¿Existe un registro o programación verificable de las raciones?'),

        // Libertad 2 — Molestias físicas y térmicas
        'Refugio / sombra': g(
            'Observación de la sombra natural o artificial disponible y del uso que hacen los animales en las horas de mayor radiación.',
            '¿Todos los animales disponen de sombra suficiente en las horas críticas?',
            '¿La sombra es accesible y no genera competencia ni hacinamiento?'),
        'Protección contra lluvia': g(
            'Inspección de techos, aleros y refugios; observación del comportamiento de los animales durante la lluvia.',
            '¿Las instalaciones protegen a los animales de la lluvia directa?',
            '¿Existen áreas secas disponibles para todo el grupo?'),
        'Ventilación': g(
            'Evaluación visual y sensorial de la ventilación (olores, humedad, condensación) y del diseño de aberturas.',
            '¿El alojamiento tiene ventilación suficiente y sin corrientes fuertes?',
            '¿Se perciben olores intensos a amoníaco o humedad excesiva?'),
        'Temperatura adecuada': g(
            'Medición de temperatura y observación de signos de estrés térmico (sudoración, jadeo, agrupamiento).',
            '¿La temperatura del alojamiento es adecuada para la especie y categoría?',
            '¿Se observan signos de estrés por frío o por calor?'),
        'Superficie de descanso': g(
            'Medición de la superficie de descanso y comparación con el número y tamaño de los animales.',
            '¿Cada animal dispone de superficie suficiente para echarse y descansar?',
            '¿La superficie es cómoda, seca y de fácil acceso?'),
        'Cama seca': g(
            'Inspección de la cama: sequedad, limpieza, espesor y frecuencia de cambio.',
            '¿La cama está seca y limpia?',
            '¿Se cambia o renueva con la frecuencia necesaria?'),
        'Espacio por animal (Tabla 3)': g(
            'Medición de áreas y comparación con la Tabla 3 de la norma ICA para la categoría evaluada.',
            '¿El espacio disponible cumple con la Tabla 3 de la norma ICA?',
            '¿Se respeta el espacio individual en comederos y zonas de descanso?'),
        'Piso no resbaladizo': g(
            'Inspección y prueba de tracción del piso en zonas de paso, descanso y alimentación.',
            '¿El piso ofrece tracción segura y está libre de desniveles?',
            '¿Se observan resbalones o caídas atribuibles al piso?'),
        'Drenajes': g(
            'Verificación de drenajes, pendientes y acumulación de agua o lodo en las instalaciones.',
            '¿Los drenajes funcionan y evitan encharcamientos?',
            '¿Las zonas de paso y descanso permanecen secas?'),
        'Limpieza de instalaciones': g(
            'Inspección de limpieza general, presencia de residuos, polvo y acumulación de estiércol.',
            '¿Las instalaciones se mantienen limpias y sin acumulación de estiércol?',
            '¿Existe una rutina o plan de limpieza verificable?'),
        'Ausencia de objetos cortopunzantes': g(
            'Recorrido visual por instalaciones y potreros en busca de objetos que puedan lesionar a los animales.',
            '¿Están ausentes clavos, alambres, vidrios o bordes cortantes?',
            '¿Las instalaciones y cercas están en buen estado y sin puntas expuestas?'),
        'Área de ejercicio': g(
            'Observación de la disponibilidad y uso de áreas de movimiento o ejercicio.',
            '¿Los animales disponen de área suficiente para moverse y ejercitarse?',
            '¿El área es segura y accesible para todo el grupo?'),
        'Transporte sin hacinamiento': g(
            'Revisión documental de la guía de movilización y del registro de transporte; verificación visual de la densidad de carga.',
            '¿La densidad de animales en el transporte permite postura y ventilación adecuadas?',
            '¿Se cuenta con guía de movilización y registro del transporte?'),
        'Aperos sin daño': g(
            'Inspección de aperos, monturas y arreos en contacto con el animal.',
            '¿Los aperos están en buen estado y ajustados sin causar lesiones?',
            '¿Se revisan y reemplazan los elementos desgastados?'),

        // Libertad 3 — Dolor, lesión y enfermedad
        'Inspección sanitaria general': g(
            'Examen visual general de los animales muestreados (ojos, mucosas, pelaje, postura, apetito).',
            '¿Los animales muestran un estado sanitario general adecuado?',
            '¿Se identifican signos de enfermedad o decaimiento?'),
        'Cojera / locomoción': g(
            'Observación de la marcha y evaluación de la cojera en los animales muestreados.',
            '¿Los animales caminan sin cojera ni dolor evidente?',
            '¿Se identifican alteraciones de la locomoción?'),
        'Lesiones en piel': g(
            'Inspección visual de la piel y del pelaje en todo el cuerpo del animal.',
            '¿La piel y el pelaje están sanos, sin lesiones ni dermatitis?',
            '¿Se observan zonas de alopecia, costras o inflamación?'),
        'Heridas abiertas': g(
            'Inspección visual y registro de heridas abiertas o sangrantes.',
            '¿Se observan heridas abiertas sin tratamiento?',
            '¿Las heridas existentes reciben atención oportuna?'),
        'Parásitos externos': g(
            'Inspección visual de piel, crin y orejas; revisión del registro de control de parásitos externos.',
            '¿Se observan garrapatas, ácaros, piojos o moscas en cantidad relevante?',
            '¿Existe control y registro de parásitos externos?'),
        'Parásitos internos': g(
            'Revisión documental del plan de desparasitación y de los resultados de coprológicos; verificación visual complementaria.',
            '¿Se aplica un plan de desparasitación interna vigente?',
            '¿Se cuenta con registro o diagnóstico de parásitos internos?'),
        'Vacunación vigente': g(
            'Revisión documental del certificado o registro de vacunación y contraste con el inventario del predio.',
            '¿La vacunación está vigente según la especie y la zona?',
            '¿Existe certificado o registro firmado por el profesional?'),
        'Cuidado de cascos': g(
            'Observación del estado de los cascos y revisión del registro de recorte o herrado.',
            '¿Los cascos están en buen estado y con recorte oportuno?',
            '¿Se registra el mantenimiento de cascos?'),
        'Cojinete plantar': g(
            'Inspección del cojinete plantar y de la planta del casco.',
            '¿El cojinete plantar está sano y sin lesiones?',
            '¿Se observan signos de dolor o inflamación en la planta?'),
        'Ausencia de prácticas dolorosas': g(
            'Entrevista y observación de las prácticas de manejo; revisión de protocolos.',
            '¿Se evitan prácticas dolorosas no justificadas (punciones, mutilaciones)?',
            '¿Las prácticas permitidas se realizan con analgesia y protocolo?'),
        'No uso de bozal permanente': g(
            'Observación del uso de bozal y del tiempo que permanece puesto.',
            '¿Se evita el bozal permanente o por periodos prolongados?',
            '¿El bozal, cuando se usa, permite respirar, beber y comer?'),
        'No uso de fusta/espuelas que lesionan': g(
            'Observación de los aperos de manejo y de las lesiones asociadas.',
            '¿Se evita el uso de fusta o espuelas que causen lesiones?',
            '¿Los elementos de manejo están diseñados para no dañar al animal?'),
        'Manejo veterinario': g(
            'Revisión documental del protocolo de manejo veterinario y de la atención de casos; verificación de la programación.',
            '¿Existe un protocolo de manejo veterinario y plan de contingencia?',
            '¿Se cuenta con atención veterinaria oportuna y registrada?'),
        'Medicamentos y tiempos de retiro': g(
            'Revisión documental de los registros de tratamientos, dosis, fechas y tiempos de retiro.',
            '¿Los medicamentos se aplican con prescripción y registro?',
            '¿Se respetan los tiempos de retiro antes de faena o consumo?'),
        'Registro de morbilidad': g(
            'Revisión documental de historias clínicas y del registro de morbilidad del predio.',
            '¿Se registran los casos de enfermedad y su evolución?',
            '¿El registro permite trazabilidad de tratamientos y resultados?'),
        'Nutrición y enfermedad': g(
            'Análisis de la relación entre la dieta y la presencia de enfermedades metabólicas o carenciales.',
            '¿La nutrición se ajusta para prevenir enfermedades carenciales?',
            '¿Se identifican casos asociados a deficiencias o excesos alimenticios?'),
        'Lesiones por aperos': g(
            'Inspección de las zonas de contacto con aperos y revisión de las lesiones presentes.',
            '¿Se observan lesiones atribuibles a monturas o arreos?',
            '¿Se ajustan o cambian los aperos que generan daño?'),

        // Libertad 4 — Temor y angustia
        'Ausencia de miedo al personal': g(
            'Observación de la reacción de los animales ante la presencia y el manejo del personal.',
            '¿Los animales se acercan o permanecen tranquilos ante el personal?',
            '¿Se observan respuestas de huida, agresividad o estrés?'),
        'Manejo sin violencia': g(
            'Observación de las prácticas de manejo y entrevista al personal.',
            '¿El manejo se realiza sin golpes, gritos ni tirones bruscos?',
            '¿El personal está capacitado en manejo de bajo estrés?'),
        'Ruidos y sobresaltos': g(
            'Observación del entorno y de la reacción de los animales ante ruidos y estímulos repentinos.',
            '¿El entorno está libre de ruidos repentinos o fuentes de sobresalto?',
            '¿Los animales muestran sobresaltos frecuentes?'),

        // Libertad 5 — Comportamiento natural
        'Expresión de conducta natural': g(
            'Observación del comportamiento en el hábitat y de la posibilidad de expresar conductas propias de la especie.',
            '¿Los animales pueden expresar conductas naturales (pastar, revolcarse, socializar)?',
            '¿El manejo o las instalaciones impiden la expresión de esas conductas?'),
        'Contacto social con otros équidos': g(
            'Observación de la composición de los grupos y de las interacciones sociales.',
            '¿Los animales se mantienen en grupos compatibles?',
            '¿Se evita el aislamiento social innecesario?'),
        'Libertad de movimiento': g(
            'Medición del espacio disponible y observación de la movilidad de los animales.',
            '¿Los animales pueden moverse, caminar y cambiar de postura libremente?',
            '¿El espacio o los amarres limitan el movimiento?'),
        'Ausencia de estereotipias': g(
            'Observación de conductas repetitivas (balanceo, morder barrotes, coprofagia) y de su frecuencia.',
            '¿Se observan estereotipias o conductas repetitivas?',
            '¿Se investigan y corrigen sus causas?'),
        'Acceso a pastoreo': g(
            'Observación de la disponibilidad de pastoreo y del tiempo de acceso.',
            '¿Los animales tienen acceso a pastoreo según su categoría?',
            '¿El tiempo de pastoreo es suficiente y seguro?')
    };
})();

function guiaIndicador(descripcion, fase) {
    const guia = GUIA[descripcion] || {
        metodologia: 'Observación directa y verificación del indicador en campo o en los registros del predio.',
        preguntas: ['¿Se cumple el indicador en el predio?', '¿Existe evidencia o registro que lo soporte?']
    };
    return {
        metodologia: guia.metodologia,
        preguntas: guia.preguntas,
        metodo: fase === 'documental' ? 'Documental' : 'Visual'
    };
}

// --- Construcción del catálogo ---------------------------------------------
function buildCapitulo(prefix, conteo) {
    const indicadores = [];
    let n = 0;
    LIBERTADES.forEach(lib => {
        const cantidad = conteo[lib.id] || 0;
        const docIdx = FASE_DOCUMENTAL[lib.id] || [];
        for (let i = 0; i < cantidad; i++) {
            n += 1;
            const pool = DESC[lib.id];
            const descripcion = pool[i % pool.length];
            const fase = docIdx.indexOf(i) >= 0 ? 'documental' : 'campo';
            const guia = guiaIndicador(descripcion, fase);
            indicadores.push({
                codigo: prefix + '-' + String(n).padStart(2, '0'),
                libertadId: lib.id,
                libertad: lib.nombre,
                pesoLibertad: lib.peso,
                descripcion: descripcion,
                fase: fase,
                metodo: guia.metodo,
                metodologia: guia.metodologia,
                preguntas: guia.preguntas
            });
        }
    });
    return indicadores;
}

const CATALOG = {
    C1: {
        name: 'Capítulo I — Cría, producción, exportación, exhibición y deporte',
        indicadores: buildCapitulo('I', CONTEO.C1)
    },
    C2: {
        name: 'Capítulo II — Traspatio y trabajo',
        indicadores: buildCapitulo('II', CONTEO.C2)
    }
};

// --- Reglas de cálculo ------------------------------------------------------
function clasificarICA(puntaje) {
    if (puntaje >= 90) return 'Excelente';
    if (puntaje >= 75) return 'Alto';
    if (puntaje >= 50) return 'Medio';
    return 'Bajo';
}

function calcularMuestra(total) {
    if (!total || total <= 0) return 0;
    if (total < 10) return total;
    if (total <= 20) return 10;
    if (total <= 99) return 20;
    if (total <= 499) return 30;
    if (total <= 999) return 40;
    return Math.ceil(total * 0.05);
}

function muestraRow(total) {
    if (!total || total <= 0) return null;
    return SAMPLE_TABLE.find(r => total >= r.min && total <= r.max) || SAMPLE_TABLE[SAMPLE_TABLE.length - 1];
}

// results: [{ libertadId, score }]  (score null = no respondido)
function calcularResultados(results) {
    const porLibertad = LIBERTADES.map(lib => {
        const items = results.filter(r => r.libertadId === lib.id && r.score !== null && r.score !== undefined);
        const n = items.length;
        const suma = items.reduce((a, r) => a + Number(r.score), 0);
        const promedio = n > 0 ? suma / n : 0;
        return {
            libertadId: lib.id,
            nombre: lib.nombre,
            peso: lib.peso,
            evaluados: n,
            promedio: promedio,
            ponderado: (promedio / 100) * lib.peso
        };
    });
    const global = porLibertad.reduce((a, l) => a + l.ponderado, 0) * 100;
    return { porLibertad, global, clasificacion: clasificarICA(global) };
}

function getIndicadorByDesc(cap, desc) {
    return CATALOG[cap].indicadores.find(i => i.descripcion === desc) || null;
}
