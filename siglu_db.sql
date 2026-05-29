-- =====================================================
-- ESQUEMA: SIGLU
-- DESCRIPCIÓN: Base de datos para gestión de legajos
--              conforme Directiva N° 236-MINSA/2017/OGGRH
-- =====================================================

-- ----------------------
-- 1. TABLAS MAESTRAS (Catálogos)
-- ----------------------

CREATE TABLE rol (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

CREATE TABLE area (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(50),
    padre_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT fk_area_padre FOREIGN KEY (padre_id) REFERENCES area(id) ON DELETE SET NULL,
    CONSTRAINT uq_area_nombre UNIQUE (nombre)
);

CREATE TABLE tipo_contrato (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT uq_tipo_contrato_nombre UNIQUE (nombre)
);

CREATE TABLE puesto_trabajo (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    codigo VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT uq_puesto_trabajo_nombre UNIQUE (nombre)
);

CREATE TABLE motivo_salida (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT uq_motivo_salida_nombre UNIQUE (nombre)
);

CREATE TABLE tipo_documento (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20),
    seccion CHAR(2) NOT NULL,
    orden SMALLINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT uq_tipo_documento_nombre UNIQUE (nombre)
);

-- ----------------------
-- 2. TABLAS TRANSACCIONALES
-- ----------------------

CREATE TABLE colaborador (
    id BIGSERIAL PRIMARY KEY,
    dni CHAR(8) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    fecha_nacimiento DATE,
    sexo CHAR(1),
    estado_civil VARCHAR(20),
    nacionalidad VARCHAR(50) DEFAULT 'PERUANA',
    correo_personal VARCHAR(150),
    telefono VARCHAR(20),
    direccion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT uq_colaborador_dni UNIQUE (dni),
    CONSTRAINT ck_colaborador_sexo CHECK (sexo IN ('M', 'F')),
    CONSTRAINT ck_colaborador_estado_civil CHECK (estado_civil IN ('SOLTERO', 'CASADO', 'CONVIVIENTE', 'DIVORCIADO', 'VIUDO'))
);

CREATE TABLE usuario (
    id BIGSERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    password_hash CHAR(60) NOT NULL,
    rol_id BIGINT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES rol(id) ON DELETE RESTRICT,
    CONSTRAINT uq_usuario_nombre_usuario UNIQUE (nombre_usuario),
    CONSTRAINT uq_usuario_correo UNIQUE (correo)
);

CREATE TABLE contrato (
    id BIGSERIAL PRIMARY KEY,
    colaborador_id BIGINT NOT NULL,
    tipo_contrato_id BIGINT NOT NULL,
    puesto_trabajo_id BIGINT NOT NULL,
    area_id BIGINT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    sueldo_base DECIMAL(15,2),
    regimen_laboral VARCHAR(50),
    regimen_pensionario VARCHAR(50),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    motivo_salida_id BIGINT,
    fecha_cese DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT fk_contrato_colaborador FOREIGN KEY (colaborador_id) REFERENCES colaborador(id) ON DELETE RESTRICT,
    CONSTRAINT fk_contrato_tipo_contrato FOREIGN KEY (tipo_contrato_id) REFERENCES tipo_contrato(id),
    CONSTRAINT fk_contrato_puesto_trabajo FOREIGN KEY (puesto_trabajo_id) REFERENCES puesto_trabajo(id),
    CONSTRAINT fk_contrato_area FOREIGN KEY (area_id) REFERENCES area(id),
    CONSTRAINT fk_contrato_motivo_salida FOREIGN KEY (motivo_salida_id) REFERENCES motivo_salida(id)
);

CREATE TABLE documento (
    id BIGSERIAL PRIMARY KEY,
    colaborador_id BIGINT NOT NULL,
    tipo_documento_id BIGINT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo TEXT NOT NULL,
    tamano_bytes BIGINT,
    mime_type VARCHAR(100),
    fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_subida_id BIGINT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT fk_documento_colaborador FOREIGN KEY (colaborador_id) REFERENCES colaborador(id) ON DELETE RESTRICT,
    CONSTRAINT fk_documento_tipo_documento FOREIGN KEY (tipo_documento_id) REFERENCES tipo_documento(id),
    CONSTRAINT fk_documento_usuario_subida FOREIGN KEY (usuario_subida_id) REFERENCES usuario(id)
);

CREATE TABLE historial_cambio (
    id BIGSERIAL PRIMARY KEY,
    tabla_afectada VARCHAR(100) NOT NULL,
    registro_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    accion VARCHAR(10) NOT NULL,
    valor_anterior JSONB,
    valor_nuevo JSONB,
    fecha_cambio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_origen INET,
    CONSTRAINT ck_historial_accion CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE'))
);

CREATE TABLE familiar (
    id BIGSERIAL PRIMARY KEY,
    colaborador_id BIGINT NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100),
    parentesco VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE,
    dni CHAR(8),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT fk_familiar_colaborador FOREIGN KEY (colaborador_id) REFERENCES colaborador(id) ON DELETE CASCADE
);

CREATE TABLE educacion (
    id BIGSERIAL PRIMARY KEY,
    colaborador_id BIGINT NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    institucion VARCHAR(200),
    titulo_obtenido VARCHAR(200),
    fecha_inicio DATE,
    fecha_fin DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT fk_educacion_colaborador FOREIGN KEY (colaborador_id) REFERENCES colaborador(id) ON DELETE CASCADE
);

CREATE TABLE capacitacion (
    id BIGSERIAL PRIMARY KEY,
    colaborador_id BIGINT NOT NULL,
    curso_nombre VARCHAR(200) NOT NULL,
    institucion VARCHAR(200),
    horas SMALLINT,
    fecha_inicio DATE,
    fecha_fin DATE,
    certificado_archivo TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT fk_capacitacion_colaborador FOREIGN KEY (colaborador_id) REFERENCES colaborador(id) ON DELETE CASCADE
);

CREATE TABLE evaluacion (
    id BIGSERIAL PRIMARY KEY,
    colaborador_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    tipo VARCHAR(50),
    resultado VARCHAR(100),
    observaciones TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT fk_evaluacion_colaborador FOREIGN KEY (colaborador_id) REFERENCES colaborador(id) ON DELETE CASCADE
);

CREATE TABLE merito_demerito (
    id BIGSERIAL PRIMARY KEY,
    colaborador_id BIGINT NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT,
    resolucion_numero VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT ck_md_tipo CHECK (tipo IN ('MERITO', 'DEMERITO'))
);

-- ----------------------
-- 3. ÍNDICES ESTRATÉGICOS
-- ----------------------

CREATE INDEX idx_colaborador_dni ON colaborador(dni);
CREATE INDEX idx_colaborador_activo ON colaborador(activo);
CREATE INDEX idx_usuario_rol ON usuario(rol_id);
CREATE INDEX idx_usuario_activo ON usuario(activo);
CREATE INDEX idx_contrato_colaborador ON contrato(colaborador_id);
CREATE INDEX idx_contrato_estado ON contrato(estado);
CREATE INDEX idx_documento_colaborador ON documento(colaborador_id);
CREATE INDEX idx_documento_tipo ON documento(tipo_documento_id);
CREATE INDEX idx_historial_tabla_registro ON historial_cambio(tabla_afectada, registro_id);
CREATE INDEX idx_historial_fecha ON historial_cambio(fecha_cambio);
CREATE INDEX idx_familiar_colaborador ON familiar(colaborador_id);
CREATE INDEX idx_educacion_colaborador ON educacion(colaborador_id);
CREATE INDEX idx_capacitacion_colaborador ON capacitacion(colaborador_id);
CREATE INDEX idx_evaluacion_colaborador ON evaluacion(colaborador_id);
CREATE INDEX idx_merito_demerito_colaborador ON merito_demerito(colaborador_id);

-- ----------------------
-- 4. DATOS MAESTROS
-- ----------------------

INSERT INTO rol (nombre, descripcion) VALUES
('admin', 'Acceso total: gestión de usuarios, reportes, configuración'),
('operador', 'Gestión de legajos, documentos, actualización de datos'),
('consulta', 'Solo lectura de legajos y reportes');

-- Usuario admin con contraseña: admin123
-- El hash bcrypt de 'admin123'
INSERT INTO usuario (nombre_usuario, correo, password_hash, rol_id, activo)
SELECT 'admin', 'admin@siglu.gob.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZ9q0Zq1n5Jv3ZQcJYbXrY7V7fK', r.id, true
FROM rol r
WHERE r.nombre = 'admin';
