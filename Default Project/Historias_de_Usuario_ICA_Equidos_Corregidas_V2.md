# HISTORIAS DE USUARIO - ICA ÉQUIDOS CORREGIDAS V2 (ICA V2 2023)

**Fecha:** 2026-10-16  
**Versión:** V2.1_CORREGIDA  
**Referencia normativa:** Metodología ICA V2 2023 - Evaluación del Bienestar Animal en Équidos  
**Secciones aplicables:** 5.4 – 5.5, Tablas 1, 3, 4, Capítulos I – II

> **Principio rector:** La norma ICA V2 2023 tiene precedencia sobre las versiones previas de HUs cuando exista conflicto. Las correcciones aquí plasmadas garantizan alineación estricta con la metodología oficial.

## 1. ACTORES UNIFICADOS

Se adopta un diccionario único de actores para garantizar coherencia entre HU, RF y BD:

| Actor | Descripción | Alcance |
|---|---|---|
| **Administrador** | Responsable de configuración, parametrización y administración del sistema. | Gestión de usuarios, roles, catálogo de indicadores, configuración global. |
| **Evaluador ICA** | Profesional capacitado para aplicar la metodología ICA V2 2023. | Realización de evaluaciones, registro de respuestas, evidencias, muestreo. |
| **Docente** | Docente vinculado a proceso formativo. | Acceso a reportes, seguimiento formativo, consulta de resultados. |
| **Consultor Externo** | Consultor autorizado para evaluación ICA. | Evaluaciones bajo alcance autorizado, generación de informes. |
| **MV/MVZ Firmante** | Médico Veterinario/Médico Veterinario Zootecnista firmante. | Gestión documental Capítulo III (firma, matrícula COMVEZCOL). |

## 2. HISTORIAS DE USUARIO CORREGIDAS

### HU-01: Gestionar fincas equinas
**ID:** HU-01 | **Prioridad:** Alta | **Actor:** Administrador / Evaluador ICA

**Como** Administrador/Evaluador ICA  
**Quiero** registrar y gestionar información de fincas equinas  
**Para** caracterizar el predio conforme a ICA V2 2023

**Criterios de Aceptación (Corregidos):**

- [ ] Debe registrar: nombre, propietario, dirección, municipio, departamento, **msnm** (metros sobre nivel del mar), **tipo** (criadero, deporte, traspatio, trabajo), **sistema_productivo** (pesebrera, potrero, mixto), **tipo_productor**, contacto.
- [ ] El campo **msnm** es obligatorio para habilitar validaciones del Capítulo II (alerta EEV cuando msnm ≤ 1500 m).
- [ ] El **tipo** y **sistema_productivo** determinan aplicación de Capítulo I vs II y contexto evaluativo.
- [ ] Debe permitir consulta, edición, activación/desactivación con trazabilidad.
- [ ] Validaciones obligatorias según esquema BD corregido.

**Justificación:** ICA V2 2023 requiere contexto geográfico (msnm) y clasificación del tipo de explotación para correcta aplicación metodológica.

---

### HU-02: Configurar inventario equino
**ID:** HU-02 | **Prioridad:** Alta | **Actor:** Evaluador ICA

**Como** Evaluador ICA  
**Quiero** registrar inventario equino por finca  
**Para** soportar cálculo de muestra (Tablas 1 y 4 ICA V2 2023)

**Criterios de Aceptación (Corregidos):**

- [ ] Debe registrar: **especie** (caballar, asnal, mular, burdegano, cerebroide), **sexo** (macho, hembra, indeterminado), categoría etaria, identificación.
- [ ] Desagregación obligatoria por **especie × grupo etario × sexo** conforme Tablas 1, 3, 4 ICA V2 2023.
- [ ] Soporte a **muestra_calculada** (derivado) con fecha/hora de cálculo para trazabilidad.
- [ ] Debe vincular a finca y permitir importación/actualización controlada.
- [ ] Integración con módulo de muestreo (**muestra_animal**).

**Justificación:** Cumple requisito de estratificación para muestreo estadísticamente fundamentado según norma.

---

### HU-03: Configurar parametrización ICA V2 2023
**ID:** HU-03 | **Prioridad:** Alta | **Actor:** Administrador

**Como** Administrador  
**Quiero** parametrizar elementos conforme ICA V2 2023  
**Para** asegurar consistencia normativa

**Criterios de Aceptación (Corregidos):**

- [ ] Catálogo de **5 Libertades** con pesos fijos: Hambre/sed/malnutrición 20%, Molestias físicas/térmicas 15%, Dolor/lesión/enfermedad 30%, Temor/angustia 15%, Comportamiento natural 20% (suma 100%).
- [ ] Catálogo indicadores **C1 (43)** y **C2 (32)** con campos: código, capítulo, libertad, descripción, método, **opciones_puntaje** ({0,20,55,100} con restricciones {0,100} cuando aplique), **versión**.
- [ ] Clasificación única ICA: **Excelente (≥90%)**, **Alto (75–89%)**, **Medio (50–74%)**, **Bajo (<50%)**. **Prohibido** esquema semáforo 80/60.
- [ ] Registro de **version_norma** por evaluación (default `ICA-V2-2023`).
- [ ] Versionado de catálogo con trazabilidad.

**Justificación:** ICA V2 2023 §5.5 establece pesos fijos y rangos únicos de clasificación. No admite ponderación uniforme ni umbrales alternativos.

---

### HU-04: Crear evaluación ICA
**ID:** HU-04 | **Prioridad:** Alta | **Actor:** Evaluador ICA

**Como** Evaluador ICA  
**Quiero** crear nueva evaluación ICA V2 2023  
**Para** iniciar proceso conforme metodología

**Criterios de Aceptación (Corregidos):**

- [ ] Debe seleccionar finca, ubicación (Etapa I), fecha, evaluador(es).
- [ ] Obligatorio definir **capítulo**: **C1** o **C2**. **Crítico:** debe mantenerse inmutable tras Etapa I.
- [ ] Registrar **version_norma = ICA-V2-2023**, msnm_evaluación, total_animales, muestra_calculada.
- [ ] Cargar automáticamente checklist correspondiente (C1:43 / C2:32) con libertades y pesos.
- [ ] Estado inicial `en_proceso`. No permitir cambio de capítulo una vez iniciadas respuestas.
- [ ] Validaciones de integridad antes de guardar.

**Justificación:** Distinción entre capítulos es fundamental para aplicación correcta de indicadores y muestreo.

---

### HU-05: Parametrización lista de chequeo por especie
**ID:** HU-05 | **Prioridad:** Alta | **Actor:** Administrador / Evaluador ICA

**Como** Administrador/Evaluador ICA  
**Quiero** asegurar correcta parametrización de pesos por libertad  
**Para** cumplir cálculo ponderado ICA V2 2023

**Criterios de Aceptación (Corregidos):**

- [ ] **Pesos fijos obligatorios:**  
  1. Hambre, sed y malnutrición: **20%**  
  2. Molestias físicas y térmicas: **15%**  
  3. Dolor, lesión y enfermedad: **30%**  
  4. Temor y angustia: **15%**  
  5. Comportamiento natural: **20%**  
  **Suma = 100%**
- [ ] Sistema debe validar suma de pesos = 100% en todo momento (check constraint + validación UI).
- [ ] No permitir modificación de pesos por usuario final (solo parametrización controlada con auditoría).
- [ ] Reflejado en BD (`libertades.peso`) y cálculo (`resultado_libertad.ponderado = promedio * peso/100`).

**Justificación:** Corrige error de "20% uniforme". ICA V2 2023 §5.5 establece ponderación diferencial (máxima ponderación a Dolor/lesión/enfermedad: 30%).

---

### HU-06: Registrar respuestas con evidencias
**ID:** HU-06 | **Prioridad:** Alta | **Actor:** Evaluador ICA

**Como** Evaluador ICA  
**Quiero** registrar puntaje por indicador con evidencias fotográficas  
**Para** documentar hallazgos conforme trazabilidad ICA

**Criterios de Aceptación (Corregidos):**

- [ ] Puntaje obtenido debe ser uno de: **{0, 20, 55, 100}**. Validación estricta (check constraint).
- [ ] Soporte para **hasta 3 fotos** por respuesta. Preferencia: tabla `evidencia_foto` (1:N, orden 1-3, metadatos). Alternativa campos foto_url1-2-3.
- [ ] Permitir registro de **numerador/denominador** para indicadores tipo porcentaje.
- [ ] Marcar `requiere_tratamiento` cuando aplique (vincula a plan de mejora).
- [ ] Vinculación opcional a `muestra_animal` (evidencia individualizada).
- [ ] Vinculación a `resultado_libertad` para trazabilidad completa.
- [ ] Auditoría de creación/modificación (quien, cuando).

**Justificación:** Garantiza evidencias válidas, cálculos auditables y trazabilidad evaluación→libertad→animal→evidencia.

---

### HU-07: Cálculo automático, ponderación y clasificación
**ID:** HU-07 | **Prioridad:** Alta | **Actor:** Sistema

**Como** Sistema  
**Quiero** calcular puntaje por libertad, ponderado y clasificación ICA  
**Para** obtener resultado conforme ICA V2 2023 §5.5

**Criterios de Aceptación (Corregidos):**

- [ ] Calcular **promedio** por libertad con base en indicadores respondidos de esa libertad.
- [ ] Calcular **ponderado** = promedio × peso_libertad / 100 (con pesos: 20,15,30,15,20).
- [ ] Puntaje **total ponderado** = sumatoria de ponderados por las 5 libertades = 100% máximo.
- [ ] **Clasificación EXCLUSIVA ICA V2 2023:**
  - Excelente: **≥ 90%**
  - Alto: **75 – 89%**
  - Medio: **50 – 74%**
  - Bajo: **< 50%**
- [ ] **Eliminar completamente** esquema semáforo (Verde/Amarillo/Rojo) con umbrales 80/60. Si se mantiene campo `semaforo`, debe derivarse ÚNICAMENTE desde clasificación ICA.
- [ ] Generar registro en `resultado_libertad` por cada una de las 5 libertades (obligatorio).
- [ ] Validar integridad: suma ponderados entre 99.5–100.5 por redondeo controlado.
- [ ] Almacenamiento con `calculado_en` para trazabilidad.

**Justificación:** Corrige HU-07 previo. ICA V2 2023 no contempla semáforo; solo clasificación por rangos oficiales.

---

### HU-08: Muestreo de animales
**ID:** HU-08 | **Prioridad:** Alta | **Actor:** Evaluador ICA

**Como** Evaluador ICA  
**Quiero** gestionar muestra animal conforme Tablas 1 y 4 ICA V2 2023  
**Para** asegurar representatividad

**Criterios de Aceptación (Corregidos):**

- [ ] Cálculo de muestra basado en inventario total, especie, grupo etario, sexo.
- [ ] Registro en `muestra_animal` con datos mínimos: especie, sexo, grupo_etario, identificación, ubicación.
- [ ] Vinculación de respuestas/evidencias a animal muestreado cuando aplique (C2 y aspectos individuales).
- [ ] Verificación de tamaño muestral vs calculado.
- [ ] Soporte a muestreo estratificado.

**Justificación:** ICA V2 2023 exige desagregación y registro de animales muestreados para validación.

---

### HU-09: Documentación soporte (Capítulo III)
**ID:** HU-09 | **Prioridad:** Alta | **Actor:** MV/MVZ Firmante / Evaluador ICA

**Como** MV/MVZ Firmante o Evaluador ICA  
**Quiero** registrar documentación de soporte  
**Para** cumplir requisitos documentales

**Criterios de Aceptación (Corregidos):**

- [ ] Gestión de `documento_soporte`: tipo_documento, **presenta** (bool), **se_niega** (bool), **firmado** (bool), **matricula_comvezcol**, nombre/cargo firmante, fecha, archivo_url.
- [ ] Validación mutua excluyente: no puede marcarse "presenta" y "se_niega" simultáneamente.
- [ ] Exigir matrícula COMVEZCOL para documentos firmados por MV/MVZ cuando aplique.
- [ ] Registro de observaciones y trazabilidad (quien, cuando).
- [ ] Soporte a documentos legibles y con firma válida.

**Justificación:** Asegura integridad documental conforme lineamientos ICA V2 2023.

---

### HU-10: Plan de mejora
**ID:** HU-10 | **Prioridad:** Alta | **Actor:** Evaluador ICA / Administrador

**Como** Evaluador ICA  
**Quiero** generar plan de mejora con acciones correctivas  
**Para** dar seguimiento a hallazgos

**Criterios de Aceptación (Corregidos):**

- [ ] Crear `plan_mejora` vinculado a evaluación, indicador (opcional), libertad.
- [ ] Campos obligatorios: título, acción, responsable, **fecha_limite**, prioridad, estado.
- [ ] Estados: pendiente, en_ejecucion, en_revision, cerrado, cancelado.
- [ ] Prioridades: baja, media, alta, critica.
- [ ] Marcar `requiere_tratamiento` cuando involucra atención sanitaria.
- [ ] Registro de fechas inicio/cierre, evidencia_cierre, seguimiento con auditoría.
- [ ] Generación automática sugerida desde respuestas con puntaje bajo o `requiere_tratamiento=true`.

**Justificación:** Cumple RF27/HU-13. Facilita cierre de brechas identificadas.

---

### HU-11: Reportes y dashboard ICA
**ID:** HU-11 | **Prioridad:** Media | **Actor:** Todos (según rol)

**Como** Usuario autorizado  
**Quiero** visualizar reportes ICA conformes a norma  
**Para** análisis y toma de decisiones

**Criterios de Aceptación (Corregidos):**

- [ ] Mostrar ponderación por las **5 libertades** con pesos oficiales (20/15/30/15/20).
- [ ] Gráfico radar por libertad (basado en `resultado_libertad`).
- [ ] Clasificación única ICA: Excelente/Alto/Medio/Bajo con colores asociados coherentes.
- [ ] **No mostrar** semáforo 80/60. Eliminar referencias a "Verde/Amarillo/Rojo" con esos umbrales.
- [ ] Reporte por capítulo (C1/C2), finca, fecha, evaluador.
- [ ] Listado de hallazgos con evidencias, plan de mejora, % cumplimiento por libertad.
- [ ] Exportación PDF con mención **ICA V2 2023**, versión norma, fecha evaluación.

**Justificación:** Reportes deben reflejar exactamente metodología oficial ICA V2 2023.

---

### HU-12: Auditoría y trazabilidad
**ID:** HU-12 | **Prioridad:** Alta | **Actor:** Administrador

**Como** Administrador  
**Quiero** garantizar trazabilidad completa  
**Para** cumplimiento normativo y seguridad

**Criterios de Aceptación (Corregidos):**

- [ ] Registro en `auditoria_trazabilidad`: tabla, id_registro, **accion** (CREATE/UPDATE/DELETE/VIEW), usuario, fecha, IP, user_agent.
- [ ] Almacenar **valor_anterior** y **valor_nuevo** (JSONB) para todas las modificaciones.
- [ ] **No eliminación física** en entidades críticas. Para DELETE: exigir **motivo_eliminacion** obligatorio y registrar en auditoría.
- [ ] Trazabilidad completa: evaluación → resultado_libertad → detalle_respuesta → evidencia_foto/muestra_animal.
- [ ] Versionado: `version_norma`, `indicadores_checklist.version`, catálogo histórico.
- [ ] Acceso restringido a módulo auditoría por rol Administrador.

**Justificación:** RF34 exige trazabilidad completa. ICA V2 2023 requiere soporte verificable de evaluaciones.

---

## 3. CONSIDERACIONES TÉCNICAS INTEGRADAS

| Aspecto | Especificación (Corregida) | Referencia |
|---|---|---|
| **Puntajes válidos** | {0, 20, 55, 100} - Validación en BD (CHECK) y lógica negocio | ICA V2 2023 |
| **Pesos libertades** | 20/15/30/15/20 - Inmutables, suma 100% | §5.5 |
| **Clasificación** | Exclusiva: ≥90/75-89/50-74/<50 - Sin semáforo 80/60 | §5.5 |
| **Capítulos** | C1=43, C2=32 - Diferenciación obligatoria | Capítulos I-II |
| **Muestreo** | Especie×sexo×grupo etario - Tablas 1,3,4 | Tablas 1,3,4 |
| **msnm** | ≤1500m → alerta EEV (Cap II) | Criterio geográfico |
| **Evidencias** | Hasta 3 fotos + numerador/denominador + animal vinculado | HU-06, trazabilidad |
| **Documentación** | presenta/se_niega excluyentes, COMVEZCOL, firmado MV/MVZ | Cap III |
| **No borrado físico** | Soft-delete con motivo + auditoría | RF34/RNF |

---

## 4. MATRIZ VALIDACIÓN NORMATIVA

| Elemento corregido | Estado | Verificable en |
|---|---|---|
| Pesos uniformes 20%→pesos oficiales 20/15/30/15/20 | **CORREGIDO** | HU-05, libertades, Script BD |
| Semáforo 80/60→Clasificación exclusiva 90/75/50 | **CORREGIDO** | HU-07, evaluaciones.clasificacion |
| Falta capitulo/version_norma | **CORREGIDO** | HU-04, evaluaciones |
| Falta msnm/tipo/sistema_productivo | **CORREGIDO** | HU-01, fincas |
| Falta especie/sexo inventario | **CORREGIDO** | HU-02, inventario_equino |
| Faltan resultado_libertad, muestra_animal, documento_soporte, plan_mejora | **CORREGIDO** | BD + HU-08/09/10 |
| Faltan evidencia_foto, numerador/denominador, id_muestra_animal, id_resultado_libertad | **CORREGIDO** | detalle_respuestas + evidencia_foto |
| Falta capitulo/metodo/opciones_puntaje/version en indicadores | **CORREGIDO** | indicadores_checklist |
| Auditoría incompleta (falta valor_anterior/valor_nuevo/accion/motivo) | **CORREGIDO** | auditoria_trazabilidad |
| Terminología DimensionBienestar→Libertad | **CORREGIDO** | Diagrama Clases |

---

**Conclusión:** Las Historias de Usuario corregidas reflejan fielmente ICA V2 2023, eliminando inconsistencias, garantizando trazabilidad completa e integrando todos los elementos críticos identificados en el análisis de correcciones.