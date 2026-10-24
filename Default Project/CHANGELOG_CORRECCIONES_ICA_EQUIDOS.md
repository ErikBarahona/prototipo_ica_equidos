# CHANGELOG - Correcciones ICA Équidos V2 2023

**Fecha:** 2026-10-16  
**Directorio de salida:** C:\Users\eb835\OneDrive - Universidad Cooperativa de Colombia\Documents\Default Project  
**Referencia normativa:** Metodología ICA V2 2023 - Evaluación del Bienestar Animal en Équidos

> **Principio rector:** La norma ICA V2 2023 tiene precedencia sobre Historias de Usuario (HU), Requisitos Funcionales (RF/RNF) y diagramas existentes cuando exista conflicto. Todas las correcciones implementadas se justifican con base en la norma.

## 1. HISTORIAS DE USUARIO (HU)

### HU-05: Parametrización de la lista de chequeo por especie
**Estado:** Corregido

**Inconsistencia identificada:** Se asignaba un peso uniforme del 20% a cada una de las cinco libertades.

**Corrección aplicada (ICA V2 2023, §5.5):** Se establece la ponderación fija oficial:

| Libertad | Peso | Justificación ICA V2 2023 |
|---|---|---|
| 1. Hambre, sed y malnutrición | **20%** | Ponderación definida en metodología V2 2023 |
| 2. Molestias físicas y térmicas | **15%** | Ponderación definida en metodología V2 2023 |
| 3. Dolor, lesión y enfermedad | **30%** | Ponderación definida en metodología V2 2023 |
| 4. Temor y angustia | **15%** | Ponderación definida en metodología V2 2023 |
| 5. Comportamiento natural | **20%** | Ponderación definida en metodología V2 2023 |

**Verificación:** Suma total = 100%. Esta ponderación es inmodificable según la norma.

### HU-07: Puntaje automático y semáforo ICA
**Estado:** Corregido

**Inconsistencia identificada:** Se proponían umbrales de semáforo (Verde ≥80%, Amarillo 60–79.9%, Rojo <60%) con referencias a libertades individuales, lo cual no corresponde a ICA V2 2023.

**Corrección aplicada (ICA V2 2023, §5.5):** Se adopta exclusivamente la clasificación oficial por rangos:

| Clasificación | Rango de puntaje | Descripción |
|---|---|---|
| **Excelente** | ≥ 90% | Nivel óptimo de bienestar |
| **Alto** | 75 – 89% | Buen nivel de bienestar |
| **Medio** | 50 – 74% | Nivel aceptable con oportunidades de mejora |
| **Bajo** | < 50% | Requiere acciones correctivas inmediatas |

**Acción correctiva:** Se elimina el esquema semáforo (Verde/Amarillo/Rojo) con umbrales 80/60. El campo `semaforo` debe derivarse exclusivamente desde la clasificación ICA, no coexistir con umbrales alternativos. Esta corrección garantiza conformidad estricta con la norma.

---

## 2. ESQUEMA DE BASE DE DATOS

### 2.1 Tabla `fincas`
**Correcciones aplicadas:**

| Campo | Tipo | Obligatorio | Justificación (ICA V2 2023) |
|---|---|---|---|
| `msnm` | NUMERIC/REAL | Sí (recomendado) | Requerido para regla Capítulo II: alerta EEV cuando msnm ≤ 1500 m (según criterios de evaluación geográfica). |
| `tipo` | ENUM('criadero','deporte','traspatio','trabajo') | Sí | Determina si corresponde aplicar Capítulo I o Capítulo II. Clasificación del tipo de explotación equina. |
| `sistema_productivo` | ENUM('pesebrera','potrero','mixto') | Sí | Necesario para contexto de evaluación y análisis de condiciones de alojamiento/alimentación. |
| `tipo_productor` | VARCHAR(150) | No | Conforme a RF06/HU-03 para caracterización del productor. |

### 2.2 Tabla `evaluaciones`
**Correcciones aplicadas:**

| Campo | Tipo | Obligatorio | Justificación |
|---|---|---|---|
| `capitulo` | ENUM('C1','C2') | Sí | **Crítico.** Distingue Capítulo I (43 indicadores) vs Capítulo II (32 indicadores). Inmutable tras Etapa I. |
| `version_norma` | VARCHAR(20) | Sí | Default: `'ICA-V2-2023'`. Garantiza trazabilidad de la norma aplicada a cada evaluación (RNF). |
| `id_ubicacion` | UUID/FK | Recomendado | Relación con ubicaciones evaluadas (Etapa I). Permite granularidad por sitio/alojamiento. |
| `clasificacion` | ENUM('Excelente','Alto','Medio','Bajo') | Sí | Única clasificación permitida según ICA V2 2023. |
| `semaforo` | Derivado | No | Si se conserva, debe derivarse exclusivamente de `clasificacion`. No debe utilizar umbrales 80/60. |

### 2.3 Tabla `inventario_equino`
**Correcciones aplicadas:**

| Campo | Tipo | Obligatorio | Justificación (ICA V2 2023) |
|---|---|---|---|
| `especie` | ENUM('caballar','asnal','mular','burdegano','cebroide') | Sí | **Crítico.** Norma requiere desagregar por especie × grupo etario × sexo (Tablas 1, 3, 4). |
| `sexo` | ENUM('macho','hembra','indeterminado') | Sí | Requerido para muestreo y análisis demográfico conforme metodología. |
| `categoria_etaria` | VARCHAR/Normalizado | Sí | Alinear con categorías de muestreo (crías lactantes, jóvenes, adultos). Se recomienda normalizar a tabla `catalogo_categoria_etaria` para consistencia. |
| `muestra_calculada` | INTEGER | Opcional | Valor derivado (Tablas 1/4). Puede calcularse on-demand; se almacena con timestamp de cálculo para trazabilidad. |

### 2.4 Tablas NUEVAS (críticas, faltantes)
Se incorporan entidades requeridas para garantizar cumplimiento normativo y trazabilidad completa:

| Tabla | Propósito | Campos clave | Justificación |
|---|---|---|---|
| `resultado_libertad` | Resultado por cada una de las 5 libertades | id, id_evaluacion(FK), id_libertad(FK), promedio, ponderado, puntaje_bruto, cumplido | Requerido para cálculo ponderado (§5.5), radar/gráficas y trazabilidad por libertad. |
| `muestra_animal` | Registro de animales muestreados | id, id_evaluacion(FK), especie, sexo, grupo_etario, identificacion, ubicacion, observacion | Verifica muestreo (BHS), identificación y condiciones por animal. Fundamenta evidencia individualizada. |
| `documento_soporte` | Documentación Capítulo III | id, id_evaluacion(FK), tipo_documento, presenta(bool), se_niega(bool), firmado(bool), matricula_comvezcol, archivo_url, observacion | Soporta legibilidad, firma MV/MVZ, matrícula COMVEZCOL, registro de presentación/negativa conforme requisitos. |
| `plan_mejora` | Planes de acción correctivas | id, id_evaluacion(FK), id_indicador(FK), accion, responsable, fecha_limite, prioridad, estado, requiere_tratamiento | Cumple RF27/HU-13. Garantiza cierre de hallazgos con responsables y plazos. |
| `evidencia_foto` (alternativa recomendada) | Soporte de evidencias fotográficas (1:N) | id, id_detalle_respuesta(FK), orden(1-3), foto_url, descripcion, metadata | Mejor que campos fijos; permite hasta 3 fotos (HU-06) con metadatos y orden. |

### 2.5 Tabla `detalle_respuestas`
**Ampliaciones aplicadas:**

| Campo | Tipo | Justificación |
|---|---|---|
| `foto_url1`, `foto_url2`, `foto_url3` | VARCHAR(500) | Soporte para hasta 3 fotos (HU-06). Alternativa: usar `evidencia_foto` (1:N) para mayor flexibilidad y trazabilidad. |
| `numerador`, `denominador` | NUMERIC | Requeridos para indicadores tipo porcentaje/cociente. Permite auditoría del cálculo. |
| `requiere_tratamiento` | BOOLEAN, DEFAULT FALSE | Marca respuestas que generan plan de mejora o requieren atención veterinaria. Vincula con `plan_mejora`. |
| `id_muestra_animal` | UUID, FK → muestra_animal | Vincula evidencia a animal específico cuando aplique (individualización de hallazgos). |
| `id_resultado_libertad` | UUID, FK → resultado_libertad | Mejora trazabilidad: respuesta → indicador → libertad → evaluación. |

### 2.6 Tabla `indicadores_checklist`
**Ampliaciones aplicadas (Catálogo ICA):**

| Campo | Tipo | Justificación |
|---|---|---|
| `capitulo` | ENUM('C1','C2') | Clasificación obligatoria: C1=43 indicadores, C2=32 indicadores (ICA V2 2023). |
| `metodo` | TEXT | Describe metodología de evaluación (observación directa, registro, verificación documental). |
| `opciones_puntaje` | JSON | Lista de valores permitidos por indicador: típicamente `{0,20,55,100}`. Algunos indicadores restringidos a `{0,100}` según criterio normativo. |
| `version` | VARCHAR(20) | Versionado de catálogo (RNF28). Permite evolución controlada manteniendo trazabilidad por evaluación. |

### 2.7 Tabla `auditoria_trazabilidad`
**Ampliaciones aplicadas (Trazabilidad completa - RF34):**

| Campo | Tipo | Justificación |
|---|---|---|
| `accion` | ENUM('CREATE','UPDATE','DELETE','VIEW') | Clasifica tipo de operación auditada para análisis de eventos. |
| `valor_anterior` | JSON/TEXT | Registra estado previo para garantizar trazabilidad completa de cambios. |
| `valor_nuevo` | JSON/TEXT | Registra estado posterior tras modificación. |
| `motivo_eliminacion` | TEXT | Soporte a "no eliminación física" (soft-delete). Debe aplicarse a entidades críticas con justificación obligatoria. |

---

## 3. DIAGRAMAS (ER y Clases)

### 3.1 ER_BD_ICA_Equidos_Corregido.drawio
**Correcciones aplicadas:**

- Actualización del esquema original (embedded en PNG) con todas las correcciones identificadas.
- Inclusión de nuevas entidades: `resultado_libertad`, `muestra_animal`, `documento_soporte`, `plan_mejora`, `evidencia_foto` (recomendado).
- Relaciones explícitas con cardinalidades correctas y FKs debidamente modeladas.
- Campos agregados en entidades existentes según sección 2.
- Inclusión de notas explicativas sobre decisiones de diseño (ICA V2 2023, pesos, clasificación, trazabilidad).
- Exportación prevista como PNG de referencia: `ER_BD_ICA_Equidos_Corregido.png` (generación mediante draw.io; XML creado con estructura completa para renderizado).

### 3.2 Diagrama_Clases_ICA_Equidos_Corregido.drawio
**Correcciones aplicadas:**

- **Terminología corregida:** Reemplazo de `DimensionBienestar` por `Libertad` (alineación estricta con ICA V2 2023). Coherente con modelo de datos y documentos.
- **Jerarquía de dominio correcta:** `Evaluacion` → `ResultadoLibertad` (5 libertades) → `ResultadoIndicador` → `DetalleRespuesta/Evidencia`. Refleja cálculo ponderado normativo.
- **Modelado completo:** Inclusión de `Capitulo` (C1/C2) en `Evaluacion` e `Indicador`.
- **Nuevas entidades de dominio:** Modelado de `MuestraAnimal`, `DocumentoSoporte`, `PlanMejora`, `EvidenciaFoto`.
- **Unificación dominio-datos:** Eliminación de divergencias conceptuales entre modelos. Diagrama alineado 100% con esquema relacional corregido.

---

## 4. REQUISITOS FUNCIONALES (RF) Y NO FUNCIONALES (RNF)

### Requisitos Funcionales (RF)
**Correcciones aplicadas:**

- **Unificación de catálogo de roles:** Diccionario único: `Administrador`, `Evaluador ICA`, `Docente`, `Consultor Externo`. Adición de `MV/MVZ Firmante` para documentación (Capítulo III).
- **Numeración corregida:** Eliminación de duplicados (ej. RF38), renumeración secuencial y coherente.
- **Trazabilidad a norma:** Referencia explícita a numerales ICA V2 2023 en RFs de cálculo, ponderación y clasificación (§5.4–§5.5).

### Requisitos No Funcionales (RNF)
**Correcciones aplicadas:**

- **Clasificación ICA exclusiva:** Obliga uso únicamente de rangos oficiales (≥90 / 75–89 / 50–74 / <50). Prohíbe coexistencia con umbrales alternativos.
- **Trazabilidad de evidencias:** Exige vinculación evaluación/libertad/animal con auditoría obligatoria ante eliminación (no eliminación física).
- **Versionado de norma:** Registro obligatorio de `version_norma` por evaluación (`ICA-V2-2023`).
- **IA como apoyo:** Se mantiene RNF25/RNF26. Recomendaciones IA son apoyo únicamente; sistema debe tener fallback funcional si API falla (resiliencia).

---

## 5. CATÁLOGO DE INDICADORES (Capítulo I y II)

Se genera `Catalogo_Indicadores_ICA_Equidos_C1_C2_V2_2023.json` con:

- **Capítulo I:** 43 indicadores (C1)
- **Capítulo II:** 32 indicadores (C2)
- **Estructura por indicador:** código, descripción, capítulo (C1/C2), libertad (1-5 según ICA V2 2023), método, opciones_puntaje con valores permitidos ({0,20,55,100}) y restricciones ({0,100}) cuando aplique.
- **Ponderación libertades:** 20/15/30/15/20 (Suma 100%)
- **Cumplimiento normativo:** Estructura alineada a ICA V2 2023 para garantizar trazabilidad y consistencia con BD.

---

## 6. ARCHIVOS GENERADOS

| Archivo | Descripción |
|---|---|
| `CHANGELOG_CORRECCIONES_ICA_EQUIDOS.md` | Este resumen de correcciones con justificación citando ICA V2 2023. |
| `Catalogo_Indicadores_ICA_Equidos_C1_C2_V2_2023.json` | Catálogo completo C1 (43) + C2 (32) con 5 libertades, pesos 20/15/30/15/20, indicadores con estructura completa. |
| `Script_BD_ICA_Equidos_Corregido_V2.sql` | DDL PostgreSQL con enums, tablas corregidas/nuevas, FKs, checks (peso suma 100, puntaje en {0,20,55,100}), índices y comentarios. |
| `ER_BD_ICA_Equidos_Corregido.drawio` | XML draw.io con ER corregido (nuevas tablas, campos, relaciones y notas). |
| `ER_BD_ICA_Equidos_Corregido.png` | Referencia gráfica del ER (generable desde XML en draw.io). |
| `Diagrama_Clases_ICA_Equidos_Corregido.drawio` | XML draw.io con diagrama de clases corregido (Libertad vs DimensionBienestar, jerarquía completa). |
| `Historias_de_Usuario_ICA_Equidos_Corregidas_V2.md` | HUs corregidas con justificación normativa ICA V2 2023. |

---

**Conclusión:** Todas las correcciones garantizan alineación estricta con ICA V2 2023 (Secciones 5.4–5.5, Tablas 1, 3, 4, Capítulos I–II). Los cambios priorizan trazabilidad, integridad referencial, auditabilidad y consistencia terminológica entre documentos, modelo de dominio y esquema de datos.