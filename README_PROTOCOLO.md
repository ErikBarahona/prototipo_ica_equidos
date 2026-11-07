# Prototipo — Sistema ICA de Bienestar Animal en Équidos

Prototipo **navegable (SPA)** en HTML + CSS + JavaScript puro, **sin frameworks** y sin servidor.
Alineado con la norma **ICA V2.0 (2023)** y con los documentos corregidos del proyecto.

---

## Cómo abrirlo

1. Abrir `index.html` con doble clic en Chrome, Edge o Firefox.
2. En el login, escribir cualquier usuario y contraseña (prototipo: no valida credenciales).
3. Navegar con el **menú lateral izquierdo**. Los datos se guardan en `localStorage`.
4. Para reiniciar el prototipo: abrir la consola del navegador y ejecutar
   `localStorage.removeItem('ica_equidos_v3')`, luego recargar.

> No requiere instalar nada ni levantar un servidor.

---

## Identidad visual

- **Logo oficial del ICA** extraído de la norma (`assets/logo-ica.png`).
- Paleta institucional tomada del propio logo:
  - Verde oscuro `#2E7331`
  - Verde `#00983F`
  - Lima `#86BB36`
  - Amarillo `#C2C700`

---

## Estructura

```
prototipo_ica_equidos/
├── index.html                     # Interfaz (todas las pantallas)
├── assets/
│   └── logo-ica.png               # Logo ICA (extraído del PDF de la norma)
├── css/
│   └── styles.css                 # Sistema de diseño (paleta ICA, responsivo)
├── js/
│   ├── data.js                    # Catálogo, etapas, muestreo y cálculos
│   ├── app.js                     # Lógica de la SPA
│   └── html2pdf.bundle.min.js     # Exportación a PDF (offline)
├── data/
│   └── ica_catalogo.json          # Catálogo exportado (C1=43, C2=32)
└── README_PROTOCOLO.md
```

---

## Flujo de trabajo implementado

### 1. Finca activa (sin reselección)

- En **Fincas** se registra el predio y, al guardarlo, queda **seleccionado automáticamente**.
- El encabezado muestra siempre la **finca activa**.
- En **Inventario** y **Nueva evaluación** no se vuelve a pedir la finca:
  se trabaja directamente sobre la finca activa.
- Para cambiar de predio: **Fincas → Seleccionar**.

### 2. Tamaño del predio y muestra (Capítulo I)

El inventario se registra por **especie × grupo etario × sexo × cantidad**.
El total de équidos determina la muestra mínima con la **Tabla 1**:

| N.º de équidos | Muestra mínima |
|---|---|
| Menos de 10 | Todos los animales |
| 11 – 20 | 10 |
| 21 – 99 | 20 |
| 100 – 499 | 30 |
| 500 – 999 | 40 |
| 1.000 o más | 5 % del total |

La tabla se muestra con el rango activo resaltado, tanto en **Inventario** como en la **Etapa I**.

### 3. Evaluación por etapas

| Etapa | Contenido en el prototipo |
|---|---|
| **Etapa I — Reunión inicial** | Información básica del predio, tamaño del predio, cálculo de muestra (con ajuste justificado) y **selección de potreros y corrales**. |
| **Etapa II — Inspección de campo** | Cada indicador de campo se presenta como **ficha normativa**: descripción, metodología, preguntas, método **Visual** y escala 100/55/20/0. Incluye marca *requiere tratamiento* y botón **Suspender evaluación** con motivo. |
| **Etapa III — Revisión documental** | Checklist de documentos (presenta / se niega / no aplica, firmado, matrícula MV/MVZ–COMVEZCOL) **y fichas de los indicadores documentales** con metodología, preguntas, método **Documental**, documento asociado y escala. Si un documento **se niega**, el indicador asociado se califica con **0**. |
| **Etapa IV — Entrega de resultados** | Puntaje global, clasificación ICA, barra de escala Bajo→Excelente, tabla por libertad, **todos los indicadores del predio** y acta en PDF. |

#### Ficha normativa del indicador (Etapas II y III)

Cada indicador muestra los campos solicitados por la norma:

| Campo | Contenido en el prototipo |
|---|---|
| **Descripción del indicador** | Nombre del indicador (p. ej. “Disponibilidad de agua”). |
| **Metodología de evaluación** | Cómo se verifica el indicador (observación directa, medición, entrevista o revisión documental). |
| **Preguntas para evaluar el indicador** | Dos preguntas guía para el evaluador. |
| **Método de evaluación** | **Visual** para indicadores de campo · **Documental** para los de la Etapa III. |
| **Escala de calificación** | **100 · Excelente** · **55 · Medio** · **20 · Bajo** · **0 · Bajo (no cumple)**. Se resalta el valor seleccionado. |

La escala del indicador se relaciona con la clasificación final **Excelente → Bajo**; el puntaje
global del predio se calcula con los pesos de las 5 libertades y se clasifica con los mismos rangos.

### 4. Clasificación final

```
Puntaje por libertad = promedio de sus indicadores (0–100)
Puntaje global = Σ (puntaje libertad × peso libertad)   [20/15/30/15/20 %]
```

| Clasificación | Rango |
|---|---|
| **Excelente** | ≥ 90 % |
| **Alto** | 75 – 89 % |
| **Medio** | 50 – 74 % |
| **Bajo** | < 50 % |

---

## Reglas ICA implementadas

| Tema | Implementación |
|---|---|
| **5 Libertades** | Agrupación de indicadores con peso fijo. |
| **Pesos** | **20 % / 15 % / 30 % / 15 % / 20 %** (suman 100 %). |
| **Capítulos** | Cap. I = **43** indicadores · Cap. II = **32**. |
| **Escala de puntaje** | Solo **0, 20, 55, 100**. |
| **Clasificación** | Excelente / Alto / Medio / Bajo (sin semáforo 80/60). |
| **Muestreo** | Tabla 1 (ver arriba), aplicada al total de animales de la finca. |
| **Inventario** | Especie × grupo etario × sexo × cantidad. |
| **Documental** | Presenta / se niega / no aplica; “se niega” ⇒ 0 en el indicador asociado. |
| **Ficha del indicador** | Descripción, metodología, preguntas, método (visual/documental) y escala 100/55/20/0. |
| **Navegación** | Menú lateral izquierdo fijo; barra superior con la finca activa. |
| **Suspensión** | Permitida en Etapa II con motivo; la evaluación puede reanudarse. |
| **Plan de mejora** | Se genera desde hallazgos (puntaje < 100 o requiere tratamiento), con acción, responsable y fecha. |

---

## Pantallas

1. **Login / Logout**
2. **Dashboard** — fincas, animales de la finca activa, evaluaciones y última clasificación.
3. **Fincas** — registro y selección de la finca activa.
4. **Inventario** — grupos de équidos, total del predio y muestra mínima.
5. **Nueva evaluación** — finca activa (solo lectura) + capítulo I/II.
6. **Evaluación en curso** — stepper de 4 etapas y fichas normativas por indicador (Etapas II y III).
7. **Historial** — evaluaciones, estado, puntaje y clasificación.
8. **Plan de mejora** — hallazgos y exportación a PDF.

---

## Notas

- Prototipo **académico/demostrativo**: autenticación, base de datos e IA de recomendaciones
  están simplificadas (se simulan con `localStorage`).
- Las descripciones, metodologías y preguntas de los indicadores son de referencia. En producción
  deben reemplazarse por el texto literal de los Capítulos I y II de la norma
  (ver `data/ica_catalogo.json`, campos `descripcion`, `metodologia` y `preguntas`).
- Principio rector: **la norma ICA V2.0 (2023) tiene precedencia** sobre historias de usuario,
  requisitos o diagramas cuando exista conflicto.
