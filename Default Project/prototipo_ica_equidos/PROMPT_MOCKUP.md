# PROMPT PARA GENERAR EL MOCKUP — Sistema ICA de Bienestar Animal en Équidos

Este documento contiene prompts listos para copiar y pegar en generadores de mockups/UI
(por ejemplo **v0, Figma AI, Uizard, Galileo AI, Visily, ChatGPT/DALL·E, Midjourney**, etc.),
construidos a partir del diseño HTML/CSS ya generado en `prototipo_ica_equidos/`.

> Nota: para **herramientas de UI generativa** (v0, Figma AI, Uizard) usa el *Prompt Maestro (ES)*.
> Para **generadores de imagen** (DALL·E, Midjourney, Ideogram) usa el *Prompt Maestro (EN)*,
> que suele dar mejores resultados visuales.

---

## 1. Sistema de diseño (tokens reales del prototipo)

| Token | Valor |
|---|---|
| Color primario | `#2C5AA0` (azul institucional) |
| Primario hover | `#1E3F73` |
| Secundario / gris | `#6C757D` (hover `#545B62`) |
| Fondo general | `#F5F5F5` |
| Superficie / tarjetas | `#FFFFFF` |
| Texto principal | `#333333` · Texto secundario `#666666` |
| Bordes | `#DDDDDD` · bordes suaves `#EEEEEE` / `#E0E0E0` |
| Encabezado de sección | `#EEF3FB` con borde inferior `#DBE4F0` |
| Fila alterna de tabla | `#FAFAFA` · cabecera de tabla `#F8F9FA` |
| Aviso informativo | fondo `#E7F3FF` |
| Alerta de plan de mejora | fondo `#FFF3CD`, borde `#FFC107` |
| Badge Excelente | `#1B8A3C` |
| Badge Alto | `#4CAF50` |
| Badge Medio | `#E6A700` |
| Badge Bajo | `#C62828` |
| Tipografía | Sans-serif del sistema (Segoe UI / Roboto / Helvetica Neue) |
| Radio de borde | 8 px tarjetas / 4 px controles / 999 px badges |
| Sombra | `0 1px 3px rgba(0,0,0,0.1)` |
| Layout | Contenedor centrado máx. 1200 px, esquinas redondeadas, diseño limpio y plano |

**Estilo visual:** institucional, sobrio, limpio, tipo panel administrativo gubernamental
(agro/sanidad). Sin degradados llamativos, sin sombras fuertes, mucho espacio en blanco.
Español (Colombia). Orientado a escritorio responsive (web).

---

## 2. Prompt Maestro (ES) — para herramientas de UI generativa

```
Genera un mockup de alta fidelidad de una aplicación web (escritorio, responsive) llamada
"Sistema ICA – Bienestar Animal en Équidos". Es una plataforma pública/administrativa para
evaluar el bienestar animal en équidos según la norma ICA V2.0 (2023).

ESTILO VISUAL:
- Estilo institucional, sobrio y limpio, tipo panel administrativo de una entidad de sanidad
  agropecuaria. Plano, sin degradados ni sombras marcadas, con mucho espacio en blanco.
- Color primario azul #2C5AA0. Fondo de página gris claro #F5F5F5. Tarjetas blancas con
  esquinas redondeadas (8 px) y sombra sutil 0 1px 3px rgba(0,0,0,0.1).
- Texto #333333, texto secundario #666666, bordes #DDDDDD.
- Tipografía sans-serif (Segoe UI / Roboto), títulos en azul #2C5AA0.
- Encabezado superior fijo de color azul #2C5AA0 con el título del sistema a la izquierda y,
  a la derecha, "Usuario: nombre" y un botón gris "Cerrar sesión".
- Barra de navegación horizontal con botones/pestañas; el botón activo se resalta en azul
  #2C5AA0 con texto blanco.
- Contenido centrado, ancho máximo 1200 px.
- Botones rectangulares redondeados (4 px): primarios azules #2C5AA0, secundarios grises #6C757D.
- Tablas limpias con cabecera gris claro #F8F9FA, filas alternas #FAFAFA y bordes #DDDDDD.
- Insignias (badges) tipo píldora para la clasificación ICA: Excelente verde #1B8A3C,
  Alto verde #4CAF50, Medio amarillo #E6A700, Bajo rojo #C62828.

PANTALLAS A GENERAR (mostrar como una galería de 8 pantallas coherentes entre sí):
1) LOGIN: tarjeta blanca centrada (~400 px) sobre fondo gris. Título del sistema, subtítulo
   "Iniciar sesión", campos "Usuario" y "Contraseña" y botón azul "Ingresar".
2) DASHBOARD: 3 tarjetas de métricas ("Total Predios", "Total Equinos", "Evaluaciones") con
   número grande en azul, y debajo una tabla de "Evaluaciones Recientes" con columnas
   Predio, Capítulo (I/II), Fecha, Estado, Puntaje y Clasificación ICA.
3) PREDIOS: formulario (Nombre del predio, Ubicación) sobre una tarjeta y una tabla con las
   columnas Nombre y Ubicación. Incluir conceptualmente campos departamento, municipio,
   vereda, coordenadas, altitud en msnm, tipo de predio y sistema productivo.
4) INVENTARIO EQUINO: formulario con selects "Predio", "Especie" (Caballar, Asnal, Mular,
   Burdegano, Cebroide), "Grupo etario", "Sexo" (Macho, Hembra, Indeterminado), campo de
   identificación y "Total animales en hato (opcional)". Debajo, un recuadro azul claro #E7F3FF
   que muestra "Muestra sugerida (auto-cálculo)" y una leyenda de muestreo. Luego una tabla de
   animales registrados (Predio, Especie, Edad, Sexo, ID/Nombre, Total hato).
5) NUEVA EVALUACIÓN: formulario con selects Predio, Equino y "Capítulo"
   ("Capítulo I – 43 indicadores", "Capítulo II – 32 indicadores"), botón azul "Iniciar evaluación".
6) EVALUACIÓN POR ETAPAS: encabezado con el contexto de la evaluación; los indicadores se
   agrupan en secciones por las 5 Libertades, cada sección con un encabezado azul claro #EEF3FB
   y una insignia de peso ("20 %", "15 %", "30 %", "15 %", "20 %"). Cada indicador es una fila
   con su código, descripción, un desplegable de puntaje (0, 20, 55, 100) y una casilla
   "Requiere tratamiento". Abajo, una zona de carga de fotos (máximo 3) y el botón
   "Guardar evaluación".
7) RESULTADOS: tarjeta con una tabla por libertad (Libertad, Peso, Indicadores evaluados,
   Promedio, Ponderado), el "Puntaje global" en porcentaje y la "Clasificación ICA" como
   insignia de color.
8) PLAN DE MEJORA: tarjeta amarilla suave #FFF3CD con borde izquierdo ámbar #FFC107; tabla de
   hallazgos con columnas Indicador, Libertad, Puntaje, Prioridad, Acción, Responsable y
   Fecha límite; botón azul "Exportar a PDF".

REQUISITOS DE COHERENCIA: mismas fuentes, mismos colores y mismos componentes en todas las
pantallas. Interfaz en español (Colombia). Sin imágenes de marcas reales. Diseño plano,
profesional, ordenado y accesible.
```

---

## 3. Prompt Maestro (EN) — para generadores de imagen (DALL·E / Midjourney / Ideogram)

```
High-fidelity UI mockup set of a desktop web application called "ICA Equine Animal Welfare
System" (Spanish-language, Colombia). Administrative/health-authority dashboard style: clean,
flat, institutional, generous white space, no gradients, subtle shadows.

Design tokens: primary blue #2C5AA0, primary hover #1E3F73, page background #F5F5F5, white
cards with 8px rounded corners and soft shadow, body text #333333, secondary text #666666,
borders #DDDDDD. Sans-serif typography (Segoe UI / Roboto), headings in blue. Fixed blue top
header with the system title on the left and "Usuario: nombre" + gray "Cerrar sesión" button on
the right. Horizontal tab navigation with the active tab highlighted in blue. Centered content,
max width 1200px. Rectangular rounded buttons (primary blue, secondary gray). Clean data tables
with light gray header #F8F9FA and alternating rows #FAFAFA. Pill badges for classification:
Excelente #1B8A3C, Alto #4CAF50, Medio #E6A700, Bajo #C62828.

Generate 8 consistent screens:
1) Login (centered white card, fields Usuario/Contraseña, blue "Ingresar" button).
2) Dashboard (3 metric cards + "Evaluaciones Recientes" table).
3) Farms "Predios" (form + table).
4) Equine Inventory (form with species caballar/asnal/mular/burdegano/cebroide, age group, sex
   macho/hembra/indeterminado; light-blue auto-sample box; animals table).
5) New Evaluation (predio, animal, chapter I/II selector).
6) Evaluation by stages (indicators grouped into 5 freedoms with weight badges 20%,15%,30%,15%,
   20%; each row has a 0/20/55/100 score dropdown and a "Requiere tratamiento" checkbox; photo
   upload area max 3; "Guardar evaluación" button).
7) Results (per-freedom table + global score + colored classification badge).
8) Improvement Plan (soft yellow #FFF3CD card, findings table with action/responsible/date,
   "Exportar a PDF" button).

Flat, professional, orderly, accessible. Consistent components across all screens. Spanish UI.
--ar 16:9
```

---

## 4. Prompts individuales (uno por pantalla)

Úsalos si quieres generar pantalla por pantalla manteniendo el mismo estilo (recomendado para
coherencia). Antepón siempre este bloque de estilo:

**[BLOQUE DE ESTILO — pegar al inicio de cada prompt]**
```
App web institucional "Sistema ICA – Bienestar Animal en Équidos". Estilo plano, limpio,
administrativo. Color primario azul #2C5AA0, fondo #F5F5F5, tarjetas blancas redondeadas 8px,
texto #333, bordes #DDD, tipografía sans-serif (Segoe UI). Encabezado azul superior con título
a la izquierda y usuario + "Cerrar sesión" a la derecha. Barra de pestañas con pestaña activa
en azul. Contenido centrado máx. 1200px. Español (Colombia). Diseño de escritorio responsive.
```

- **Pantalla — Login:**
  `[BLOQUE DE ESTILO] Pantalla de inicio de sesión: tarjeta blanca centrada de 400px sobre fondo gris, título "Sistema ICA – Bienestar Animal en Équidos", subtítulo "Iniciar sesión", dos campos con etiquetas "Usuario" y "Contraseña", botón azul "Ingresar". Sin menú de navegación.`

- **Pantalla — Dashboard:**
  `[BLOQUE DE ESTILO] Panel principal con 3 tarjetas Métricas ("Total Predios", "Total Equinos", "Evaluaciones") con número grande azul y borde izquierdo azul; debajo, tarjeta con tabla "Evaluaciones Recientes" (columnas: Predio, Capítulo, Fecha, Estado, Puntaje, Clasificación ICA) con insignias de color en la última columna.`

- **Pantalla — Predios:**
  `[BLOQUE DE ESTILO] Sección "Predios": tarjeta con formulario (Nombre del predio, Ubicación, botón azul "Agregar predio") y debajo tarjeta con tabla (Nombre, Ubicación). Incluir visualmente campos de departamento, municipio, vereda, coordenadas, altitud msnm, tipo de predio y sistema productivo.`

- **Pantalla — Inventario Equino:**
  `[BLOQUE DE ESTILO] Sección "Inventario Equino": formulario con selects Predio, Especie (Caballar, Asnal, Mular, Burdegano, Cebroide), Grupo etario, Sexo (Macho, Hembra, Indeterminado), campo Identificación/Nombre, campo Total animales en hato, botón azul "Agregar equino". Recuadro azul claro con "Muestra sugerida (auto-cálculo)" y leyenda de muestreo. Tabla inferior (Predio, Especie, Edad, Sexo, ID/Nombre, Total hato).`

- **Pantalla — Nueva Evaluación:**
  `[BLOQUE DE ESTILO] Sección "Nueva Evaluación": tarjeta con selects Predio, Equino y Capítulo ("Capítulo I – 43 indicadores", "Capítulo II – 32 indicadores"), botón azul "Iniciar evaluación".`

- **Pantalla — Evaluación por Etapas:**
  `[BLOQUE DE ESTILO] Sección "Evaluación por Etapas": encabezado gris claro con contexto (predio, animal, capítulo, etapa). Indicadores agrupados en 5 secciones por Libertad, cada una con encabezado azul claro #EEF3FB e insignia azul de peso (20%, 15%, 30%, 15%, 20%). Cada indicador: código azul, descripción, desplegable de puntaje (0/20/55/100) y checkbox "Requiere tratamiento". Abajo, área de carga de fotos "máximo 3" y botón "Guardar evaluación".`

- **Pantalla — Resultados:**
  `[BLOQUE DE ESTILO] Sección "Resultados": tarjeta con tabla por libertad (Libertad, Peso, Indicadores evaluados, Promedio, Ponderado), línea de "Puntaje global: XX.XX%" y "Clasificación ICA" mostrada como insignia de color (verde/ámbar/rojo).`

- **Pantalla — Plan de Mejora:**
  `[BLOQUE DE ESTILO] Sección "Plan de Mejora": tarjeta amarilla suave #FFF3CD con borde izquierdo ámbar #FFC107; tabla de hallazgos (Indicador, Libertad, Puntaje, Prioridad, Acción, Responsable, Fecha límite) con campos editables; botón azul "Exportar a PDF".`

---

## 5. Prompt negativo (para IMEs de imagen)

```
No incluir degradados llamativos, sombras duras, glassmorphism, neón, 3D, ilustraciones
infantiles, texto ilegible, idioma inglés en la interfaz, logotipos de marcas reales,
ni colores fuera de la paleta institucional azul/gris.
```

---

## 6. Consejos rápidos por herramienta

- **v0 / Figma AI / Uizard / Galileo / Visily:** pega el *Prompt Maestro (ES)*. Pide primero solo
  una pantalla (Dashboard) para fijar el sistema de diseño y luego "usa el mismo estilo" para las demás.
- **DALL·E / Ideogram:** pega el *Prompt Maestro (EN)*; pide una **imagen por pantalla** para
  evitar texto pequeño ilegible.
- **Midjourney:** usa el *Prompt Maestro (EN)* + `--ar 16:9 --style raw --v 6` y evita texto largo
  (Midjourney renderiza mal el texto; úsalo para estilo/ambiente, no para texto exacto).
- **Coherencia:** genera primero el **Dashboard**, guarda la imagen como referencia y adjúntala
  ("image prompt") en las siguientes generaciones para mantener el mismo estilo.
- Si necesitas fidelidad total al diseño real, importa el `index.html` en **Figma (html.to.design)**
  o usa **v0** pegando el HTML/CSS del prototipo.

---

## 7. Prompt corto (versión de una sola línea)

```
Mockup UI de un panel web administrativo llamado "Sistema ICA – Bienestar Animal en Équidos",
estilo institucional plano, azul #2C5AA0 sobre gris #F5F5F5, tarjetas blancas redondeadas,
tablas limpias, insignias de clasificación en verde/amarillo/rojo, tipografía Segoe UI, español;
8 pantallas: login, dashboard, predios, inventario equino (especie/edad/sexo y muestra sugerida),
nueva evaluación con Capítulo I/II, evaluación por etapas agrupada en 5 libertades con pesos
20/15/30/15/20 y escala 0/20/55/100, resultados con clasificación ICA y plan de mejora con
exportación a PDF. Diseño coherente, limpio y profesional, escritorio responsive.
```

---

*Fuente del diseño: `prototipo_ica_equidos/index.html` y `prototipo_ica_equidos/css/styles.css`. Norma de referencia: ICA V2.0 (2023).*
