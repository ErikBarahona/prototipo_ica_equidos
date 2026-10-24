# CORRECCIONES RÁPIDAS - ICA ÉQUIDOS (Norma V2 2023)

**Fecha:** 2026-10-16  
**Directorio:** C:\Users\eb835\OneDrive - Universidad Cooperativa de Colombia\Documents\Default Project

> **Principio rector:** La norma ICA V2 2023 tiene precedencia sobre Historias de Usuario (HUs), Requisitos Funcionales (RF/RNF) y diagramas existentes cuando exista conflicto.

## 1. Correcciones en Historias de Usuario (HU)

### HU-05: "Parametrización de la lista de chequeo por especie"

**INCORRECTO (actual):**
> "Se asignará un peso del 20% a cada una de las cinco libertades, de modo que la suma total sea siempre 100%."

**CORRECTO (según norma ICA V2 2023, §5.5):**
> "Cada una de las cinco libertades tiene un peso fijo definido por la metodología ICA V2 2023: 
> - Hambre, sed y malnutrición: **20%**
> - Molestias físicas y térmicas: **15%**
> - Dolor, lesión y enfermedad: **30%**
> - Temor y angustia: **15%**
> - Comportamiento natural: **20%**
> Suma total = **100%**."

### HU-07: "Puntaje automático y semáforo ICA"

**INCORRECTO (actual):**
> Se propone semáforo con umbrales: Verde ≥ 80% y ninguna libertad < 60%; Amarillo 60–79.9% o alguna libertad 40–59.9%; Rojo < 60% o alguna libertad < 40%.

**CORRECTO (según norma ICA V2 2023, §5.5):**
> La clasificación debe realizarse **únicamente** con los rangos oficiales ICA:
> - **Excelente:** ≥ 90%
> - **Alto:** 75–89%
> - **Medio:** 50–74%
> - **Bajo:** < 50%

**Acción:** Eliminar el esquema "semaforo" (Verde/Amarillo/Rojo) con los umbrales 80/60. El campo `semaforo` existente en la BD debe reemplazarse/justificarse únicamente si se mapea desde la clasificación ICA. No deben coexistir ambos esquemas.

## 2. Correcciones en Esquema de Base de Datos (Esquema Diagrama Base de Datos.drawio.png)

### A. Tabla `fincas`
- [ ] **Añadir `msnm` (altitud)** (int/float). Requerido para la regla Capítulo II: alerta EEV cuando msnm ≤ 1500 m.
- [ ] **Añadir `tipo`** (enum: `criadero`, `deporte`, `traspatio`, `trabajo`) — necesario para determinar Capítulo I vs II.
- [ ] **Añadir `sistema_productivo`** (enum: `pesebrera`, `potrero`, `mixto`)
- [ ] **Añadir `tipo_productor`** (string) — conforme a RF06/HU-03.

### B. Tabla `evaluaciones`
- [ ] **Añadir `capitulo`** (enum: `C1`, `C2`). **Crítico:** Distingue Capítulo I (43 indicadores) vs Capítulo II (32). Inmutable tras Etapa I.
- [ ] **Añadir `version_norma`** (varchar, default `ICA-V2-2023`) para trazabilidad.
- [ ] **Añadir `id_ubicacion`** o relación con ubicaciones evaluadas (Etapa I).
- [ ] **Evaluar campos `clasificacion` y `semaforo`:** Mantener **únicamente** `clasificacion` con valores {Excelente, Alto, Medio, Bajo}. Si `semaforo` se conserva, debe derivarse de la clasificación ICA, nunca con umbrales 80/60.

### C. Tabla `inventario_equino`
- [ ] **Añadir `especie`** (enum: `caballar`, `asnal`, `mular`, `burdegano`, `cebroide`). **Crítico:** Norma requiere desagregar por especie × grupo etario × sexo.
- [ ] **Añadir `sexo`** (enum: `macho`, `hembra`, `indeterminado`) 
- [ ] **Revisar `categoria_etaria`:** Alinear con categorías usadas en muestreo (crías lactantes, jóvenes, adultos). Considerar normalización a tabla `catalogo_categoria_etaria`.
- [ ] **Nota:** `muestra_calculada` es un valor derivado (Tabla 1/4). Puede calcularse on-demand; almacenarlo es aceptable si se justifica con fecha/hora de cálculo.

### D. Tablas NUEVAS críticas (faltantes en diagrama)

| Tabla | Descripción | Campos mínimos |
|---|---|---|
| **resultado_libertad** | Resultado por cada libertad con promedio y ponderado (requerido para radar) | id_resultado_libertad(PK), id_evaluacion(FK), id_libertad(FK), promedio, ponderado, puntaje_bruto, cumplido |
| **muestra_animal** | Animales muestreados (identificación) para verificar BHS, identificación, condiciones por animal | id_muestra_animal(PK), id_evaluacion(FK), especie, sexo, grupo_etario, identificacion, ubicacion, observacion |
| **documento_soporte** | Documentación Cap III (legible, firmado MV/MVZ, matrícula COMVEZCOL, presenta/se niega) | id_documento(PK), id_evaluacion(FK), tipo_documento, presenta(bool), se_niega(bool), firmado(bool), matricula_comvezcol, archivo_url, observacion |
| **plan_mejora** | Plan de acción (RF27/HU-13) | id_plan_mejora(PK), id_evaluacion(FK), id_indicador(FK), accion, responsable, fecha_limite, prioridad, estado, requiere_tratamiento |

### E. `detalle_respuestas`
- [ ] **Soporte para hasta 3 fotos** (HU-06). Añadir `foto_url1`, `foto_url2`, `foto_url3` o crear tabla `evidencia_foto` (1:N) con metadatos.
- [ ] **Añadir `numerador` y `denominador`** (numéricos). Requeridos para indicadores tipo porcentaje.
- [ ] **Añadir `requiere_tratamiento`** (boolean, default false).
- [ ] **Añadir `id_muestra_animal` (FK)** para vincular evidencia a animal específico cuando aplique.
- [ ] **Añadir `id_resultado_libertad` (FK)** para mejorar trazabilidad.

### F. `indicadores_checklist`
- [ ] **Añadir `capitulo`** (enum C1/C2)
- [ ] **Añadir `metodo`** (texto) — describe cómo evaluar (observación/directa/registro)
- [ ] **Añadir `opciones_puntaje`** (json) — lista de valores permitidos {0,20,55,100} por indicador (algunos restringidos a {0,100})
- [ ] **Añadir `version`** (varchar) para versionado (RNF28)

### G. `auditoria_trazabilidad`
- [ ] **Añadir `accion`** (enum: CREATE/UPDATE/DELETE/VIEW)
- [ ] **Añadir `valor_anterior` / `valor_nuevo`** (json/text) para trazabilidad completa (RF34)
- [ ] **Mantener `no eliminación física`** (soft-delete con motivo) — debe aplicarse a entidades críticas.

## 3. Correcciones en Diagrama de Clases

- [ ] **Reemplazar `DimensionBienestar` por `Libertad`** — alinear terminología con ICA V2 2023 (coherente con BD y documentos).
- [ ] **Estructura jerárquica correcta:** `Evaluacion` → `ResultadoLibertad` (5) → `ResultadoIndicador` → `DetalleRespuesta/Evidencia`.
- [ ] **Incluir `Capitulo` (C1/C2)`** en `Evaluacion` y `Indicador`.
- [ ] **Modelar `MuestraAnimal`, `DocumentoSoporte`, `PlanMejora`** en diagrama de clases.
- [ ] **Unificar modelo dominio-datos:** Evitar mantener dos modelos conceptuales distintos.

## 4. Correcciones en RF/RNF

### Requisitos Funcionales
- [ ] **Unificar catálogo de roles** en un único diccionario de actores: `Administrador`, `Evaluador ICA`, `Docente`, `Consultor Externo`. Añadir **`MV/MVZ Firmante`** cuando aplique a documentación (Cap III).
- [ ] **Corregir numeración RF** (eliminar duplicados como RF38 mencionado, renumerar secuencialmente).
- [ ] **Añadir trazabilidad a norma** (referenciar numeral ICA V2 2023) en RFs de cálculo/ponderación/clasificación.

### Requisitos No Funcionales
- [ ] **Garantizar clasificación ICA exclusiva:** RNF que obligue a usar únicamente rangos 90/75/50.
- [ ] **Trazabilidad de evidencias:** RNF que exija vinculación evaluación/libertad/animal + auditoría ante eliminación.
- [ ] **Versionado de norma:** RNF que registre `version_norma` por evaluación (`ICA-V2-2023`).
- [ ] **AI como apoyo:** Mantener RNF25/RNF26 (recomendaciones IA son apoyo; deben tener fallback si API falla).

## Referencias
- **Norma ICA V2 2023:** Metodología para Evaluar el Bienestar Animal en Équidos. Secciones 5.4–5.5, Tablas 1, 3, 4, Capítulos I–II.
- **Archivos base:** Requerimientos Aplicación ICA (1).docx, Analisis_Plataforma_BA_Equidos_V2_Fusionado.docx, Historias de Usuario de la Aplicación IA (1).docx, Esquema Diagrama Base de Datos.drawio.png