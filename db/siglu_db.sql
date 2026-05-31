-- =============================================================================
-- SIGLU - Sistema de Gestión de Legajos de Usuarios
-- PostgreSQL 17 - Esquema optimizado y limpio
-- Mejoras aplicadas:
--   - GENERATED ALWAYS AS IDENTITY (reemplaza secuencias manuales)
--   - timestamptz en lugar de timestamp without time zone
--   - varchar en lugar de character varying (más limpio)
--   - char(N) fijo solo donde realmente se necesita
--   - CHECKs simplificados y nuevos CHECKs de consistencia
--   - Índices adicionales en columnas de JOIN frecuente
--   - FK faltante en historial_cambio.usuario_id
--   - Eliminadas líneas \restrict / \unrestrict no estándar
-- =============================================================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';
SET default_table_access_method = heap;

-- =============================================================================
-- DOMINIOS REUTILIZABLES
-- Centralizan las reglas de negocio en un solo lugar
-- =============================================================================

CREATE DOMAIN public.dni_pe AS varchar(8)
    CHECK (VALUE ~ '^\d{8}$');

CREATE DOMAIN public.sexo_tipo AS char(1)
    CHECK (VALUE IN ('M', 'F'));

CREATE DOMAIN public.estado_civil_tipo AS varchar(20)
    CHECK (VALUE IN ('SOLTERO', 'CASADO', 'CONVIVIENTE', 'DIVORCIADO', 'VIUDO'));

-- =============================================================================
-- TABLA: rol
-- =============================================================================
CREATE TABLE public.rol (
    id          bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre      varchar(50) NOT NULL,
    descripcion text,
    created_at  timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by  bigint,
    updated_by  bigint,
    CONSTRAINT uq_rol_nombre UNIQUE (nombre)
);

ALTER TABLE public.rol OWNER TO siglu;

-- =============================================================================
-- TABLA: usuario
-- =============================================================================
CREATE TABLE public.usuario (
    id              bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_usuario  varchar(50)  NOT NULL,
    correo          varchar(150) NOT NULL,
    -- bcrypt produce siempre 60 caracteres; char(60) es correcto aquí
    password_hash   char(60)     NOT NULL,
    rol_id          bigint       NOT NULL,
    activo          boolean      NOT NULL DEFAULT true,
    ultimo_acceso   timestamptz,
    created_at      timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      bigint,
    updated_by      bigint,
    CONSTRAINT uq_usuario_nombre_usuario UNIQUE (nombre_usuario),
    CONSTRAINT uq_usuario_correo         UNIQUE (correo),
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id)
        REFERENCES public.rol (id) ON DELETE RESTRICT
);

ALTER TABLE public.usuario OWNER TO siglu;

CREATE INDEX idx_usuario_rol    ON public.usuario USING btree (rol_id);
CREATE INDEX idx_usuario_activo ON public.usuario USING btree (activo);

-- =============================================================================
-- TABLA: area
-- =============================================================================
CREATE TABLE public.area (
    id         bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre     varchar(200) NOT NULL,
    codigo     varchar(50),
    padre_id   bigint,
    created_at timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by bigint,
    updated_by bigint,
    CONSTRAINT uq_area_nombre UNIQUE (nombre),
    CONSTRAINT fk_area_padre FOREIGN KEY (padre_id)
        REFERENCES public.area (id) ON DELETE SET NULL
);

ALTER TABLE public.area OWNER TO siglu;

-- =============================================================================
-- TABLA: puesto_trabajo
-- =============================================================================
CREATE TABLE public.puesto_trabajo (
    id         bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre     varchar(150) NOT NULL,
    codigo     varchar(30),
    created_at timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by bigint,
    updated_by bigint,
    CONSTRAINT uq_puesto_trabajo_nombre UNIQUE (nombre)
);

ALTER TABLE public.puesto_trabajo OWNER TO siglu;

-- =============================================================================
-- TABLA: tipo_contrato
-- =============================================================================
CREATE TABLE public.tipo_contrato (
    id         bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre     varchar(100) NOT NULL,
    codigo     varchar(20),
    created_at timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by bigint,
    updated_by bigint,
    CONSTRAINT uq_tipo_contrato_nombre UNIQUE (nombre)
);

ALTER TABLE public.tipo_contrato OWNER TO siglu;

-- =============================================================================
-- TABLA: motivo_salida
-- =============================================================================
CREATE TABLE public.motivo_salida (
    id         bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre     varchar(100) NOT NULL,
    created_at timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by bigint,
    updated_by bigint,
    CONSTRAINT uq_motivo_salida_nombre UNIQUE (nombre)
);

ALTER TABLE public.motivo_salida OWNER TO siglu;

-- =============================================================================
-- TABLA: tipo_documento
-- =============================================================================
CREATE TABLE public.tipo_documento (
    id         bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre     varchar(100) NOT NULL,
    codigo     varchar(20),
    -- char(2) fijo es intencional: código de sección siempre 2 caracteres
    seccion    char(2)      NOT NULL,
    orden      smallint     NOT NULL DEFAULT 0,
    created_at timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by bigint,
    updated_by bigint,
    CONSTRAINT uq_tipo_documento_nombre UNIQUE (nombre)
);

ALTER TABLE public.tipo_documento OWNER TO siglu;

-- =============================================================================
-- TABLA: colaborador
-- Usa los dominios definidos arriba para sexo y estado_civil
-- =============================================================================
CREATE TABLE public.colaborador (
    id                 bigint                   GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- dni_pe valida formato 8 dígitos numéricos
    dni                public.dni_pe            NOT NULL,
    nombres            varchar(100)             NOT NULL,
    apellido_paterno   varchar(100)             NOT NULL,
    apellido_materno   varchar(100),
    fecha_nacimiento   date,
    sexo               public.sexo_tipo,
    estado_civil       public.estado_civil_tipo,
    nacionalidad       varchar(50)              NOT NULL DEFAULT 'PERUANA',
    correo_personal    varchar(150),
    telefono           varchar(20),
    direccion          text,
    activo             boolean                  NOT NULL DEFAULT true,
    created_at         timestamptz              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         timestamptz              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by         bigint,
    updated_by         bigint,
    CONSTRAINT uq_colaborador_dni UNIQUE (dni)
);

ALTER TABLE public.colaborador OWNER TO siglu;

CREATE INDEX idx_colaborador_dni    ON public.colaborador USING btree (dni);
CREATE INDEX idx_colaborador_activo ON public.colaborador USING btree (activo);

-- =============================================================================
-- TABLA: contrato
-- CHECK de consistencia: si está cesado, debe tener fecha_cese y motivo
-- =============================================================================
CREATE TABLE public.contrato (
    id                   bigint          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    colaborador_id       bigint          NOT NULL,
    tipo_contrato_id     bigint          NOT NULL,
    puesto_trabajo_id    bigint          NOT NULL,
    area_id              bigint          NOT NULL,
    fecha_inicio         date            NOT NULL,
    fecha_fin            date,
    sueldo_base          numeric(15, 2),
    -- Valores conocidos de régimen laboral en Perú; ajustar según catálogo propio
    regimen_laboral      varchar(50)
        CONSTRAINT ck_contrato_regimen_laboral
            CHECK (regimen_laboral IN (
                'D.LEG. 728', 'D.LEG. 1057 (CAS)', 'D.LEG. 276',
                'LEY 30057 (SERVIR)', 'OTRO'
            )),
    -- Valores conocidos de régimen pensionario en Perú
    regimen_pensionario  varchar(50)
        CONSTRAINT ck_contrato_regimen_pensionario
            CHECK (regimen_pensionario IN ('ONP', 'AFP', 'NINGUNO', 'OTRO')),
    estado               boolean         NOT NULL DEFAULT true,
    motivo_salida_id     bigint,
    fecha_cese           date,
    created_at           timestamptz     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           timestamptz     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by           bigint,
    updated_by           bigint,
    -- Si el contrato está inactivo (cesado), fecha_cese y motivo son obligatorios
    CONSTRAINT ck_contrato_cese_consistente
        CHECK (estado = true OR (fecha_cese IS NOT NULL AND motivo_salida_id IS NOT NULL)),
    -- fecha_fin debe ser posterior a fecha_inicio
    CONSTRAINT ck_contrato_fechas
        CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
    CONSTRAINT fk_contrato_colaborador    FOREIGN KEY (colaborador_id)    REFERENCES public.colaborador    (id) ON DELETE RESTRICT,
    CONSTRAINT fk_contrato_tipo_contrato  FOREIGN KEY (tipo_contrato_id)  REFERENCES public.tipo_contrato  (id),
    CONSTRAINT fk_contrato_puesto_trabajo FOREIGN KEY (puesto_trabajo_id) REFERENCES public.puesto_trabajo (id),
    CONSTRAINT fk_contrato_area           FOREIGN KEY (area_id)           REFERENCES public.area           (id),
    CONSTRAINT fk_contrato_motivo_salida  FOREIGN KEY (motivo_salida_id)  REFERENCES public.motivo_salida  (id)
);

ALTER TABLE public.contrato OWNER TO siglu;

CREATE INDEX idx_contrato_colaborador    ON public.contrato USING btree (colaborador_id);
CREATE INDEX idx_contrato_estado         ON public.contrato USING btree (estado);
-- Índices faltantes en el original:
CREATE INDEX idx_contrato_area           ON public.contrato USING btree (area_id);
CREATE INDEX idx_contrato_tipo_contrato  ON public.contrato USING btree (tipo_contrato_id);
CREATE INDEX idx_contrato_puesto_trabajo ON public.contrato USING btree (puesto_trabajo_id);

-- =============================================================================
-- TABLA: documento
-- Nota: fecha_subida fue eliminada — es redundante con created_at
-- =============================================================================
CREATE TABLE public.documento (
    id                bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    colaborador_id    bigint       NOT NULL,
    tipo_documento_id bigint       NOT NULL,
    nombre_archivo    varchar(255) NOT NULL,
    ruta_archivo      text         NOT NULL,
    tamano_bytes      bigint,
    mime_type         varchar(100),
    usuario_subida_id bigint       NOT NULL,
    activo            boolean      NOT NULL DEFAULT true,
    created_at        timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by        bigint,
    updated_by        bigint,
    CONSTRAINT fk_documento_colaborador    FOREIGN KEY (colaborador_id)    REFERENCES public.colaborador    (id) ON DELETE RESTRICT,
    CONSTRAINT fk_documento_tipo_documento FOREIGN KEY (tipo_documento_id) REFERENCES public.tipo_documento (id),
    CONSTRAINT fk_documento_usuario_subida FOREIGN KEY (usuario_subida_id) REFERENCES public.usuario        (id)
);

ALTER TABLE public.documento OWNER TO siglu;

CREATE INDEX idx_documento_colaborador    ON public.documento USING btree (colaborador_id);
CREATE INDEX idx_documento_tipo           ON public.documento USING btree (tipo_documento_id);
-- Índice faltante en el original:
CREATE INDEX idx_documento_usuario_subida ON public.documento USING btree (usuario_subida_id);

-- =============================================================================
-- TABLA: educacion
-- =============================================================================
CREATE TABLE public.educacion (
    id               bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    colaborador_id   bigint       NOT NULL,
    nivel            varchar(50)  NOT NULL,
    institucion      varchar(200),
    titulo_obtenido  varchar(200),
    fecha_inicio     date,
    fecha_fin        date,
    created_at       timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       bigint,
    updated_by       bigint,
    CONSTRAINT ck_educacion_fechas
        CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
    CONSTRAINT fk_educacion_colaborador FOREIGN KEY (colaborador_id)
        REFERENCES public.colaborador (id) ON DELETE CASCADE
);

ALTER TABLE public.educacion OWNER TO siglu;

CREATE INDEX idx_educacion_colaborador ON public.educacion USING btree (colaborador_id);

-- =============================================================================
-- TABLA: capacitacion
-- =============================================================================
CREATE TABLE public.capacitacion (
    id                  bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    colaborador_id      bigint       NOT NULL,
    curso_nombre        varchar(200) NOT NULL,
    institucion         varchar(200),
    horas               smallint,
    fecha_inicio        date,
    fecha_fin           date,
    certificado_archivo text,
    created_at          timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          bigint,
    updated_by          bigint,
    CONSTRAINT ck_capacitacion_horas
        CHECK (horas IS NULL OR horas > 0),
    CONSTRAINT ck_capacitacion_fechas
        CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
    CONSTRAINT fk_capacitacion_colaborador FOREIGN KEY (colaborador_id)
        REFERENCES public.colaborador (id) ON DELETE CASCADE
);

ALTER TABLE public.capacitacion OWNER TO siglu;

CREATE INDEX idx_capacitacion_colaborador ON public.capacitacion USING btree (colaborador_id);

-- =============================================================================
-- TABLA: evaluacion
-- =============================================================================
CREATE TABLE public.evaluacion (
    id             bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    colaborador_id bigint       NOT NULL,
    fecha          date         NOT NULL,
    tipo           varchar(50),
    resultado      varchar(100),
    observaciones  text,
    created_at     timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by     bigint,
    updated_by     bigint,
    CONSTRAINT fk_evaluacion_colaborador FOREIGN KEY (colaborador_id)
        REFERENCES public.colaborador (id) ON DELETE CASCADE
);

ALTER TABLE public.evaluacion OWNER TO siglu;

CREATE INDEX idx_evaluacion_colaborador ON public.evaluacion USING btree (colaborador_id);

-- =============================================================================
-- TABLA: familiar
-- Nota: dni usa varchar(8), no char(8), para evitar relleno con espacios
-- =============================================================================
CREATE TABLE public.familiar (
    id               bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    colaborador_id   bigint      NOT NULL,
    nombres          varchar(100) NOT NULL,
    apellidos        varchar(100),
    parentesco       varchar(50)  NOT NULL,
    fecha_nacimiento date,
    dni              varchar(8),
    activo           boolean      NOT NULL DEFAULT true,
    created_at       timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       bigint,
    updated_by       bigint,
    CONSTRAINT fk_familiar_colaborador FOREIGN KEY (colaborador_id)
        REFERENCES public.colaborador (id) ON DELETE CASCADE
);

ALTER TABLE public.familiar OWNER TO siglu;

CREATE INDEX idx_familiar_colaborador ON public.familiar USING btree (colaborador_id);

-- =============================================================================
-- TABLA: merito_demerito
-- =============================================================================
CREATE TABLE public.merito_demerito (
    id                 bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    colaborador_id     bigint      NOT NULL,
    tipo               varchar(10) NOT NULL,
    fecha              date        NOT NULL,
    descripcion        text,
    resolucion_numero  varchar(50),
    created_at         timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by         bigint,
    updated_by         bigint,
    CONSTRAINT ck_md_tipo CHECK (tipo IN ('MERITO', 'DEMERITO')),
    CONSTRAINT fk_merito_demerito_colaborador FOREIGN KEY (colaborador_id)
        REFERENCES public.colaborador (id) ON DELETE CASCADE
);

ALTER TABLE public.merito_demerito OWNER TO siglu;

CREATE INDEX idx_merito_demerito_colaborador ON public.merito_demerito USING btree (colaborador_id);

-- =============================================================================
-- TABLA: historial_cambio
-- Mejora: FK a usuario agregada (faltaba en el original)
-- =============================================================================
CREATE TABLE public.historial_cambio (
    id              bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tabla_afectada  varchar(100) NOT NULL,
    registro_id     bigint       NOT NULL,
    usuario_id      bigint       NOT NULL,
    accion          varchar(11)  NOT NULL,
    valor_anterior  text,
    valor_nuevo     text,
    fecha_cambio    timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_origen       varchar(45),
    CONSTRAINT ck_historial_accion
        CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE')),
    -- FK faltante en el original
    CONSTRAINT fk_historial_usuario FOREIGN KEY (usuario_id)
        REFERENCES public.usuario (id) ON DELETE RESTRICT
);

ALTER TABLE public.historial_cambio OWNER TO siglu;

CREATE INDEX idx_historial_fecha         ON public.historial_cambio USING btree (fecha_cambio);
CREATE INDEX idx_historial_tabla_registro ON public.historial_cambio USING btree (tabla_afectada, registro_id);
-- Índice faltante en el original:
CREATE INDEX idx_historial_usuario        ON public.historial_cambio USING btree (usuario_id);

-- =============================================================================
-- DATOS INICIALES
-- =============================================================================

-- Roles: columnas explícitas en el mismo orden que la tabla
-- (id lo genera la secuencia; created_by/updated_by NULL en seed inicial)
INSERT INTO public.rol (nombre, descripcion, created_at, updated_at, created_by, updated_by) VALUES
    ('admin',    'Acceso total: gestión de usuarios, reportes, configuración', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
    ('operador', 'Gestión de legajos, documentos, actualización de datos',     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL),
    ('consulta', 'Solo lectura de legajos y reportes',                          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- Usuario administrador inicial
-- IMPORTANTE: cambiar el hash de contraseña antes de ir a producción
INSERT INTO public.usuario (nombre_usuario, correo, password_hash, rol_id, activo, ultimo_acceso, created_at, updated_at, created_by, updated_by) VALUES
    ('admin', 'admin@siglu.gob.pe', '$2b$10$1gBs4OXcbY7rznlxwtl96uJidUiDV1B/uvnGzv2fOSJIjoj8qgpse', 1, true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

-- =============================================================================
-- PERMISOS
-- =============================================================================
-- siglu ya es dueño de todos los objetos (ALTER TABLE ... OWNER TO siglu),
-- por lo que ALTER DEFAULT PRIVILEGES no es necesario y puede causar errores
-- si el script no se ejecuta como el rol postgres. Solo se garantiza acceso al schema.

GRANT USAGE ON SCHEMA public TO siglu;

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================
