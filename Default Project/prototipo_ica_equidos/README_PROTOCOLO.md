# Prototipo — Sistema ICA de Bienestar Animal en Équidos

Prototipo **navegable (SPA)** en HTML + CSS + JavaScript puro, **sin frameworks** y sin servidor.
Alineado estrictamente con la norma **ICA V2.0 (2023)** y con los documentos corregidos del proyecto.

---

## Cómo abrirlo

1. Abrir el archivo `index.html` con doble clic en Chrome, Edge o Firefox.
2. En el login, escribir cualquier usuario y contraseña (es un prototipo; no valida credenciales).
3. Navegar con el menú superior. Los datos se guardan en `localStorage` del navegador.

> No requiere instalar nada ni levantar un servidor.

---

## Estructura del proyecto

```
prototipo_ica_equidos/
├── index.html                          # Interfaz (todas las pantallas)
├── css/
│   └── styles.css                      # Estilos (limpio y responsivo)
├── js/
│   ├── data.js                         # Catálogo ICA + cálculos (fuente de verdad)
│   ├── app.js                          # Lógica de la SPA
│   └── html2pdf.bundle.min.js          # Exportación a PDF (bundle local, offline)
├── data/
│   └── ica_catalogo.json               # Catálogo exportado (referencia / integración)
└── README_PROTOCOLO.md
```

---

## Reglas ICA implementadas (correcciones aplicadas)

| Tema | Implementación en el prototipo |
|---|---|
| **5 Libertades** | Se muestran agrupadas con su peso fijo. |
| **Pesos** | **20 % / 15 % / 30 % / 15 % / 20 %** (suman 100 %). **No** son pesos iguales. |
| **Capítulos** | Cap. I = **43** indicadores · Cap. II = **32** indicadores. |
| **Escala de puntaje** | Solo se permiten **0, 20, 55, 100**. |
| **Cálculo** | Promedio por libertad → × peso de la libertad → suma = **puntaje global (0–100 %)**. |
| **Clasificación** | **Excelente ≥90 · Alto 75–89 · Medio 50–74 · Bajo <50**. |
| **Semáforo 80/60** | **Eliminado** (era inconsistente con la norma). |
| **Muestreo** | <10 → todos · 11–20 → 10 · 21–99 → 20 · 100–499 → 30 · 500–999 → 40 · ≥1000 → 5 %. |
| **Evidencias** | Hasta **3 fotos** por evaluación. |
| **Inventario** | Por **especie × grupo etario × sexo** (caballar/asnal/mular/burdégano/cebroide; macho/hembra/indeterminado). |
| **Campos extra** | `requiere_tratamiento` por indicador; alerta EEV si el predio está a **≤1500 msnm** (se registra msnm). |
| **Plan de mejora** | Se genera desde los hallazgos (puntaje <100 o requiere tratamiento). |

---

## Pantallas incluidas

1. **Login / Logout**
2. **Dashboard** — totales de predios, animales y evaluaciones.
3. **Predios** — nombre y ubicación (en el modelo de datos: departamento, municipio, vereda, coordenadas, msnm, tipo, sistema productivo).
4. **Inventario equino** — especie + grupo etario + sexo + identificación + total del hato, con cálculo automático de la muestra.
5. **Nueva evaluación** — selección de predio, animal, **Capítulo (I/II)** y **Etapa (EI–EIV)**.
6. **Evaluación** — indicadores agrupados por **libertad**, escala 0/20/55/100, checkbox *requiere tratamiento*, hasta 3 fotos.
7. **Resultados** — tabla por libertad (peso, promedio, ponderado), **puntaje global** y **clasificación ICA**.
8. **Plan de mejora** — hallazgos con acción, responsable y fecha límite; **Exportar a PDF**.

---

## Notas

- Prototipo **académico/demostrativo**: la autenticación, la base de datos y la IA de recomendaciones
  están simplificadas (se simulan con `localStorage`).
- El catálogo de indicadores usa descripciones de referencia; en producción deben reemplazarse por el
  listado literal de los Capítulos I y II de la norma (ver `data/ica_catalogo.json`).
- Principio rector: **la norma ICA V2.0 (2023) tiene precedencia** sobre las historias de usuario,
  requisitos o diagramas cuando exista conflicto.
