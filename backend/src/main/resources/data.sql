-- Insertar roles
INSERT INTO rol (nombre, descripcion, created_at, updated_at) VALUES
('admin', 'Acceso total: gestión de usuarios, reportes, configuración', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('operador', 'Gestión de legajos, documentos, actualización de datos', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('consulta', 'Solo lectura de legajos y reportes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar usuario admin (password: admin123)
-- El hash bcrypt de 'admin123' es: $2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZ9q0Zq1n5Jv3ZQcJYbXrY7V7fK
INSERT INTO usuario (nombre_usuario, correo, password_hash, rol_id, activo, created_at, updated_at)
SELECT 'admin', 'admin@siglu.gob.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZ9q0Zq1n5Jv3ZQcJYbXrY7V7fK', r.id, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM rol r
WHERE r.nombre = 'admin'
ON CONFLICT (nombre_usuario) DO NOTHING;

-- Insertar algunas áreas de ejemplo
INSERT INTO area (nombre, codigo, created_at, updated_at) VALUES
('SEDE CENTRAL', 'SC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('C.S. I-4 BALSAPUERTO', 'CSBAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('C.S. I-3 CARRETERA KM 1.5', 'CSKM15', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar tipos de contrato
INSERT INTO tipo_contrato (nombre, codigo, created_at, updated_at) VALUES
('CAS Indeterminado', 'CAS-IND', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CAS Confianza', 'CAS-CONF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DL N° 276', 'DL276', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar puestos de trabajo
INSERT INTO puesto_trabajo (nombre, created_at, updated_at) VALUES
('DIGITADOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ABOGADO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MEDICO CIRUJANO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (nombre) DO NOTHING;
