-- =====================================================
-- SCRIPT DDL - ICA ÉQUIDOS CORREGIDO V2 (ICA V2 2023)
-- Fecha: 2026-10-16
-- Versión norma: ICA-V2-2023
-- DBMS: PostgreSQL
-- Descripción: Esquema corregido alineado a ICA V2 2023
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE capitulo_enum AS ENUM ('C1', 'C2');
CREATE TYPE especie_enum AS ENUM ('caballar', 'asnal', 'mular', 'burdegano', 'cebroide');
CREATE TYPE sexo_enum AS ENUM ('macho', 'hembra', 'indeterminado');
CREATE TYPE tipo_finca_enum AS ENUM ('criadero', 'deporte', 'traspatio', 'trabajo');
CREATE TYPE sistema_productivo_enum AS ENUM ('pesebrera', 'potrero', 'mixto');
CREATE TYPE clasificacion_ica_enum AS ENUM ('Excelente', 'Alto', 'Medio', 'Bajo');
CREATE TYPE estado_evaluacion_enum AS ENUM ('en_proceso', 'pendiente_revision', 'finalizada', 'anulada');
CREATE TYPE prioridad_plan_enum AS ENUM ('baja', 'media', 'alta', 'critica');
CREATE TYPE estado_plan_enum AS ENUM ('pendiente', 'en_ejecucion', 'en_revision', 'cerrado', 'cancelado');
CREATE TYPE accion_auditoria_enum AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW');

-- =====================================================
-- 1. FINCAS
-- =====================================================

CREATE TABLE fincas (
  id_finca UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_finca VARCHAR(255) NOT NULL,
  propietario VARCHAR(255) NOT NULL,
  direccion VARCHAR(500) NOT NULL,
  municipio VARCHAR(150) NOT NULL,
  departamento VARCHAR(150) NOT NULL,
  msnm NUMERIC(8,2) NOT NULL CHECK (msnm >= 0),
  tipo tipo_finca_enum NOT NULL,
  sistema_productivo sistema_productivo_enum NOT NULL,
  tipo_productor VARCHAR(150),
  telefono_contacto VARCHAR(30),
  correo_contacto VARCHAR(150),
  observaciones TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE fincas IS 'Fincas/equipamientos equinos evaluados según ICA V2 2023';
COMMENT ON COLUMN fincas.msnm IS 'Metros sobre nivel del mar. Crítico Capítulo II: alerta EEV cuando msnm <= 1500 m';
COMMENT ON COLUMN fincas.tipo IS 'Clasifica tipo de explotación para determinar C1/C2';
COMMENT ON COLUMN fincas.sistema_productivo IS 'Sistema de manejo: pesebrera/potrero/mixto';

-- =====================================================
-- 2. UBICACIONES (Alojamientos/Sitios evaluados - Etapa I)
-- =====================================================

CREATE TABLE ubicaciones (
  id_ubicacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_finca UUID NOT NULL REFERENCES fincas(id_finca) ON DELETE RESTRICT,
  nombre_ubicacion VARCHAR(150) NOT NULL,
  tipo_ubicacion VARCHAR(100),
  capacidad_maxima INT CHECK (capacidad_maxima > 0),
  observaciones TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 3. LIBERTADES (5 Libertades ICA V2 2023)
-- =====================================================

CREATE TABLE libertades (
  id_libertad INTEGER PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  peso NUMERIC(5,2) NOT NULL CHECK (peso > 0 AND peso <= 100),
  activo BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE libertades IS '5 Libertades Bienestar Animal según ICA V2 2023';
INSERT INTO libertades (id_libertad, nombre, descripcion, peso) VALUES
  (1, 'Hambre, sed y malnutrición', 'Libre de hambre, sed y malnutrición', 20.00),
  (2, 'Molestias físicas y térmicas', 'Libre de molestias físicas y térmicas', 15.00),
  (3, 'Dolor, lesión y enfermedad', 'Libre de dolor, lesión y enfermedad', 30.00),
  (4, 'Temor y angustia', 'Libre de temor y angustia', 15.00),
  (5, 'Comportamiento natural', 'Libre para expresar comportamientos naturales', 20.00);

-- Verificación suma pesos
-- SELECT SUM(peso) FROM libertades; debe ser 100.00

-- =====================================================
-- 4. INDICADORES CHECKLIST (C1 y C2)
-- =====================================================

CREATE TABLE indicadores_checklist (
  id_indicador UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(10) NOT NULL UNIQUE,
  capitulo capitulo_enum NOT NULL,
  id_libertad INTEGER NOT NULL REFERENCES libertades(id_libertad),
  descripcion TEXT NOT NULL,
  metodo TEXT,
  opciones_puntaje JSONB NOT NULL DEFAULT '[0, 20, 55, 100]',
  version VARCHAR(20) NOT NULL DEFAULT 'ICA-V2-2023',
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE indicadores_checklist IS 'Catálogo indicadores ICA V2 2023: C1 (43) + C2 (32)';
COMMENT ON COLUMN indicadores_checklist.capitulo IS 'C1: 43 indicadores, C2: 32 indicadores';
COMMENT ON COLUMN indicadores_checklist.opciones_puntaje IS 'Valores permitidos: típicamente {0,20,55,100}. Algunos restringidos a {0,100}';
COMMENT ON COLUMN indicadores_checklist.version IS 'Versionado catálogo para trazabilidad (RNF28)';

CREATE INDEX idx_indicadores_capitulo ON indicadores_checklist(capitulo);
CREATE INDEX idx_indicadores_libertad ON indicadores_checklist(id_libertad);
CREATE INDEX idx_indicadores_codigo ON indicadores_checklist(codigo);

-- =====================================================
-- 5. CATEGORÍAS ETARIAS (Normalización muestreo)
-- =====================================================

CREATE TABLE catalogo_categoria_etaria (
  id_categoria UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE
);

INSERT INTO catalogo_categoria_etaria (codigo, nombre, descripcion) VALUES
  ('CRIA_LACTANTE', 'Cría lactante', 'Crías en periodo lactante'),
  ('JOVEN', 'Joven', 'Animales jóvenes post-lactancia'),
  ('ADULTO', 'Adulto', 'Animales adultos'),
  ('SENIL', 'Senil', 'Animales geriátricos');

-- =====================================================
-- 6. INVENTARIO EQUINO
-- =====================================================

CREATE TABLE inventario_equino (
  id_equino UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_finca UUID NOT NULL REFERENCES fincas(id_finca) ON DELETE RESTRICT,
  id_categoria_etaria UUID REFERENCES catalogo_categoria_etaria(id_categoria_etaria),
  especie especie_enum NOT NULL,
  sexo sexo_enum NOT NULL,
  nombre_identificacion VARCHAR(100),
  nro_identificacion VARCHAR(100),
  fecha_nacimiento DATE,
  peso_aproximado NUMERIC(8,2) CHECK (peso_aproximado > 0),
  categoria_etaria VARCHAR(100),
  observaciones TEXT,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE inventario_equino IS 'Inventario total equinos por finca';
COMMENT ON COLUMN inventario_equino.especie IS 'Crítico: desagregar por especie x grupo etario x sexo (Tablas 1,3,4 ICA V2 2023)';

CREATE INDEX idx_equino_finca ON inventario_equino(id_finca);
CREATE INDEX idx_equino_especie ON inventario_equino(especie);

-- =====================================================
-- 7. EVALUACIONES
-- =====================================================

CREATE TABLE evaluaciones (
  id_evaluacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_finca UUID NOT NULL REFERENCES fincas(id_finca) ON DELETE RESTRICT,
  id_ubicacion UUID REFERENCES ubicaciones(id_ubicacion),
  codigo_evaluacion VARCHAR(50) NOT NULL UNIQUE,
  fecha_evaluacion DATE NOT NULL,
  hora_inicio TIMESTAMP WITH TIME ZONE,
  hora_fin TIMESTAMP WITH TIME ZONE,
  evaluador_principal VARCHAR(255) NOT NULL,
  evaluadores_auxiliares VARCHAR(500),
  capitulo capitulo_enum NOT NULL,
  version_norma VARCHAR(20) NOT NULL DEFAULT 'ICA-V2-2023',
  tipo_finca_aplicado tipo_finca_enum,
  sistema_productivo_aplicado sistema_productivo_enum,
  msnm_evaluacion NUMERIC(8,2),
  total_animales INT CHECK (total_animales >= 0),
  muestra_calculada INT CHECK (muestra_calculada >= 0),
  porcentaje_total NUMERIC(6,2) CHECK (porcentaje_total >= 0 AND porcentaje_total <= 100),
  clasificacion clasificacion_ica_enum,
  estado estado_evaluacion_enum DEFAULT 'en_proceso',
  observaciones_generales TEXT,
  requiere_plan_mejora BOOLEAN DEFAULT FALSE,
  creado_por VARCHAR(150),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  finalizado_en TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE evaluaciones IS 'Evaluaciones ICA V2 2023 por finca/ubicación';
COMMENT ON COLUMN evaluaciones.capitulo IS 'Crítico: C1 (43) vs C2 (32). Inmutable tras Etapa I';
COMMENT ON COLUMN evaluaciones.version_norma IS 'Trazabilidad norma aplicada (ICA-V2-2023)';
COMMENT ON COLUMN evaluaciones.clasificacion IS 'Única clasificación permitida: Excelente/Alto/Medio/Bajo (ICA V2 2023)';
COMMENT ON COLUMN evaluaciones.muestra_calculada IS 'Derivado Tablas 1/4. Puede calcularse on-demand';

CREATE INDEX idx_eval_finca ON evaluaciones(id_finca);
CREATE INDEX idx_eval_fecha ON evaluaciones(fecha_evaluacion);
CREATE INDEX idx_eval_capitulo ON evaluaciones(capitulo);
CREATE INDEX idx_eval_estado ON evaluaciones(estado);

-- =====================================================
-- 8. RESULTADO POR LIBERTAD (CRÍTICO)
-- =====================================================

CREATE TABLE resultado_libertad (
  id_resultado_libertad UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_evaluacion UUID NOT NULL REFERENCES evaluaciones(id_evaluacion) ON DELETE CASCADE,
  id_libertad INTEGER NOT NULL REFERENCES libertades(id_libertad),
  promedio NUMERIC(6,2) CHECK (promedio >= 0 AND promedio <= 100),
  ponderado NUMERIC(6,2) CHECK (ponderado >= 0 AND ponderado <= 100),
  puntaje_bruto NUMERIC(6,2) CHECK (puntaje_bruto >= 0 AND ponderado >= 0),
  cumplido BOOLEAN DEFAULT FALSE,
  observacion TEXT,
  calculado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_resultado_libertad_eval UNIQUE (id_evaluacion, id_libertad)
);

COMMENT ON TABLE resultado_libertad IS 'Resultado por cada libertad con promedio y ponderado (ICA V2 2023 §5.5)';
COMMENT ON COLUMN resultado_libertad.ponderado IS 'Contribución ponderada: promedio * peso/100';

CREATE INDEX idx_reslib_eval ON resultado_libertad(id_evaluacion);
CREATE INDEX idx_reslib_lib ON resultado_libertad(id_libertad);

-- =====================================================
-- 9. MUESTRA ANIMAL (Animales muestreados)
-- =====================================================

CREATE TABLE muestra_animal (
  id_muestra_animal UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_evaluacion UUID NOT NULL REFERENCES evaluaciones(id_evaluacion) ON DELETE CASCADE,
  id_equino UUID REFERENCES inventario_equino(id_equino),
  especie especie_enum NOT NULL,
  sexo sexo_enum NOT NULL,
  grupo_etario VARCHAR(100),
  categoria_etaria VARCHAR(100),
  identificacion VARCHAR(100),
  ubicacion VARCHAR(150),
  muestreado BOOLEAN DEFAULT TRUE,
  observacion TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE muestra_animal IS 'Animales muestreados para verificación BHS, identificación y condiciones individuales';
CREATE INDEX idx_muestra_eval ON muestra_animal(id_evaluacion);
CREATE INDEX idx_muestra_equino ON muestra_animal(id_equino);

-- =====================================================
-- 10. DETALLE RESPUESTAS
-- =====================================================

CREATE TABLE detalle_respuestas (
  id_detalle UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_evaluacion UUID NOT NULL REFERENCES evaluaciones(id_evaluacion) ON DELETE CASCADE,
  id_indicador UUID NOT NULL REFERENCES indicadores_checklist(id_indicador),
  id_resultado_libertad UUID REFERENCES resultado_libertad(id_resultado_libertad),
  id_muestra_animal UUID REFERENCES muestra_animal(id_muestra_animal),
  puntaje_obtenido INT NOT NULL CHECK (puntaje_obtenido IN (0, 20, 55, 100)),
  observacion TEXT,
  foto_url1 VARCHAR(500),
  foto_url2 VARCHAR(500),
  foto_url3 VARCHAR(500),
  numerador NUMERIC(12,4),
  denominador NUMERIC(12,4) CHECK (denominador IS NULL OR denominador >= 0),
  requiere_tratamiento BOOLEAN DEFAULT FALSE,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  registrado_por VARCHAR(150),
  CONSTRAINT chk_puntaje_valido CHECK (puntaje_obtenido IN (0,20,55,100))
);

COMMENT ON TABLE detalle_respuestas IS 'Respuestas por indicador con evidencias y trazabilidad';
COMMENT ON COLUMN detalle_respuestas.puntaje_obtenido IS 'Valores permitidos ICA: 0, 20, 55, 100';
COMMENT ON COLUMN detalle_respuestas.numerador IS 'Para indicadores tipo porcentaje/cociente';
COMMENT ON COLUMN detalle_respuestas.id_muestra_animal IS 'Vincula evidencia a animal específico cuando aplique';
COMMENT ON COLUMN detalle_respuestas.foto_url1 IS 'Soporte hasta 3 fotos (HU-06)';

CREATE INDEX idx_det_eval ON detalle_respuestas(id_evaluacion);
CREATE INDEX idx_det_indic ON detalle_respuestas(id_indicador);
CREATE INDEX idx_det_reslib ON detalle_respuestas(id_resultado_libertad);
CREATE INDEX idx_det_muestra ON detalle_respuestas(id_muestra_animal);

-- =====================================================
-- 11. EVIDENCIA FOTO (1:N - Recomendado)
-- =====================================================

CREATE TABLE evidencia_foto (
  id_evidencia_foto UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_detalle UUID NOT NULL REFERENCES detalle_respuestas(id_detalle) ON DELETE CASCADE,
  orden INT NOT NULL CHECK (orden >= 1 AND orden <= 3),
  foto_url VARCHAR(500) NOT NULL,
  descripcion TEXT,
  nombre_archivo VARCHAR(255),
  tipo_archivo VARCHAR(50),
  tamano_bytes BIGINT,
  registrado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  registrado_por VARCHAR(150),
  CONSTRAINT uq_evidencia_orden UNIQUE (id_detalle, orden)
);

COMMENT ON TABLE evidencia_foto IS 'Evidencias fotográficas (máx 3 por detalle) con metadatos';
CREATE INDEX idx_foto_detalle ON evidencia_foto(id_detalle);

-- =====================================================
-- 12. DOCUMENTO SOPORTE (Capítulo III)
-- =====================================================

CREATE TABLE documento_soporte (
  id_documento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_evaluacion UUID NOT NULL REFERENCES evaluaciones(id_evaluacion) ON DELETE CASCADE,
  tipo_documento VARCHAR(150) NOT NULL,
  presenta BOOLEAN DEFAULT FALSE,
  se_niega BOOLEAN DEFAULT FALSE,
  firmado BOOLEAN DEFAULT FALSE,
  matricula_comvezcol VARCHAR(100),
  nombre_firmante VARCHAR(255),
  cargo_firmante VARCHAR(150),
  fecha_presentacion DATE,
  archivo_url VARCHAR(500),
  observacion TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  creado_por VARCHAR(150),
  CONSTRAINT chk_presentacion CHECK (NOT (presenta AND se_niega))
);

COMMENT ON TABLE documento_soporte IS 'Documentación soporte: legible, firmado MV/MVZ, matrícula COMVEZCOL, presenta/se niega';
CREATE INDEX idx_doc_eval ON documento_soporte(id_evaluacion);
CREATE INDEX idx_doc_tipo ON documento_soporte(tipo_documento);

-- =====================================================
-- 13. PLAN MEJORA
-- =====================================================

CREATE TABLE plan_mejora (
  id_plan_mejora UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_evaluacion UUID NOT NULL REFERENCES evaluaciones(id_evaluacion) ON DELETE CASCADE,
  id_indicador UUID REFERENCES indicadores_checklist(id_indicador),
  id_libertad INTEGER REFERENCES libertades(id_libertad),
  titulo VARCHAR(255) NOT NULL,
  accion TEXT NOT NULL,
  responsable VARCHAR(255) NOT NULL,
  fecha_limite DATE NOT NULL,
  prioridad prioridad_plan_enum DEFAULT 'media',
  estado estado_plan_enum DEFAULT 'pendiente',
  requiere_tratamiento BOOLEAN DEFAULT FALSE,
  fecha_inicio DATE,
  fecha_cierre DATE,
  evidencia_cierre TEXT,
  observaciones TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  creado_por VARCHAR(150),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  actualizado_por VARCHAR(150),
  CONSTRAINT chk_fechas_plan CHECK (fecha_cierre IS NULL OR fecha_cierre >= fecha_inicio)
);

COMMENT ON TABLE plan_mejora IS 'Plan de acción correctiva (RF27/HU-13) con seguimiento';
CREATE INDEX idx_plan_eval ON plan_mejora(id_evaluacion);
CREATE INDEX idx_plan_indic ON plan_mejora(id_indicador);
CREATE INDEX idx_plan_estado ON plan_mejora(estado);
CREATE INDEX idx_plan_prioridad ON plan_mejora(prioridad);

-- =====================================================
-- 14. AUDITORIA TRAZABILIDAD
-- =====================================================

CREATE TABLE auditoria_trazabilidad (
  id_auditoria UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabla_afectada VARCHAR(100) NOT NULL,
  id_registro_afectado UUID,
  accion accion_auditoria_enum NOT NULL,
  usuario VARCHAR(150) NOT NULL,
  fecha_accion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  direccion_ip VARCHAR(50),
  user_agent TEXT,
  valor_anterior JSONB,
  valor_nuevo JSONB,
  motivo_eliminacion TEXT,
  observacion TEXT
);

COMMENT ON TABLE auditoria_trazabilidad IS 'Trazabilidad completa con valores anterior/nuevo y soft-delete con motivo (RF34)';
COMMENT ON COLUMN auditoria_trazabilidad.accion IS 'CREATE/UPDATE/DELETE/VIEW';
COMMENT ON COLUMN auditoria_trazabilidad.motivo_eliminacion IS 'Obligatorio para acciones DELETE en entidades críticas';
CREATE INDEX idx_aud_tabla ON auditoria_trazabilidad(tabla_afectada);
CREATE INDEX idx_aud_fecha ON auditoria_trazabilidad(fecha_accion);
CREATE INDEX idx_aud_usuario ON auditoria_trazabilidad(usuario);

-- =====================================================
-- 15. VISTAS ÚTILES (Cálculo y validación ICA)
-- =====================================================

-- Vista resumen por evaluación
CREATE VIEW vw_resumen_evaluacion AS
SELECT 
  e.id_evaluacion,
  e.codigo_evaluacion,
  f.nombre_finca,
  e.fecha_evaluacion,
  e.capitulo,
  e.clasificacion,
  e.version_norma,
  ROUND(SUM(rl.ponderado), 2) AS puntaje_total_ponderado,
  e.estado
FROM evaluaciones e
JOIN fincas f ON f.id_finca = e.id_finca
LEFT JOIN resultado_libertad rl ON rl.id_evaluacion = e.id_evaluacion
GROUP BY e.id_evaluacion, f.nombre_finca;

-- Vista validación pesos libertades
CREATE VIEW vw_validacion_pesos AS
SELECT 
  id_libertad,
  nombre,
  peso,
  (SELECT SUM(peso) FROM libertades) AS suma_total
FROM libertades;

-- =====================================================
-- 16. CHECKS ADICIONALES (Integridad)
-- =====================================================

-- Validar suma ponderada por evaluación <= 100
-- Aplicado via lógica aplicación + constraints
ALTER TABLE resultado_libertad ADD CONSTRAINT chk_ponderado_rango CHECK (ponderado >= 0 AND ponderado <= 100);
ALTER TABLE resultado_libertad ADD CONSTRAINT chk_promedio_rango CHECK (promedio >= 0 AND promedio <= 100);

-- Validar clasificación coherente con rangos ICA (ver nota aplicación)
-- Excelente >=90, Alto 75-89, Medio 50-74, Bajo <50

-- =====================================================
-- FIN SCRIPT
-- =====================================================

COMMENT ON SCHEMA public IS 'Esquema ICA Équidos V2 2023 - Corregido conforme norma';
