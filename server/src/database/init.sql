-- ======================================
-- SCRIPT DE INICIALIZACIÓN COMPLETO
-- Base de Datos: Prácticas Profesionales Pascualinas
-- Versión: 2.0 - Sistema Completo
-- ======================================

-- ======================================
-- TABLA: usuarios (CON ROL Y VERIFICACIÓN)
-- ======================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),  -- Opcional: solo para estudiantes/admin
    celular VARCHAR(20),
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(15),
    rol VARCHAR(20) CHECK (rol IN ('administrador', 'empresa', 'estudiante')) NOT NULL,
    verificado BOOLEAN DEFAULT FALSE,  -- Campo para email y aprobación
    token_verificacion VARCHAR(255),   -- Solo para estudiantes
    token_expira TIMESTAMP,            -- Solo para estudiantes
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP
);

CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_verificado ON usuarios(verificado);


-- ======================================
-- TABLA: administradores
-- ======================================
CREATE TABLE IF NOT EXISTS administradores (
    admin_id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    cargo VARCHAR(100) NOT NULL,
    departamento VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE
);


-- ======================================
-- TABLA: empresas
-- ======================================
CREATE TABLE IF NOT EXISTS empresas (
    nit_id INT PRIMARY KEY,
    usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    razon_social VARCHAR(100) NOT NULL,
    nombre_reclutador VARCHAR(100) NOT NULL,
    contacto_correo VARCHAR(100) NOT NULL,
    contacto_telefono VARCHAR(15),
    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ======================================
-- TABLA: estudiantes
-- ======================================
CREATE TABLE IF NOT EXISTS estudiantes (
    cedula_id INT PRIMARY KEY,
    usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    programa VARCHAR(100) NOT NULL,
    creditos_aprobados INT CHECK (creditos_aprobados >= 0),
    modulo_empleabilidad BOOLEAN DEFAULT FALSE
);


-- ======================================
-- TABLA: hojas de vida
-- ======================================
CREATE TABLE IF NOT EXISTS hojas_vida (
    id SERIAL PRIMARY KEY,
    estudiante_id INT REFERENCES estudiantes(cedula_id) ON DELETE CASCADE,
    nombre_perfil VARCHAR(100) NOT NULL,
    descripcion TEXT,
    habilidades TEXT[],
    experiencia TEXT,
    educacion TEXT,
    archivo_pdf VARCHAR(255),
    es_principal BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Solo puede haber una hoja de vida principal por estudiante
CREATE UNIQUE INDEX idx_hoja_vida_principal 
ON hojas_vida(estudiante_id) 
WHERE es_principal = TRUE;


-- ======================================
-- TABLA: vacantes
-- ======================================
CREATE TABLE IF NOT EXISTS vacantes (
    vacante_id SERIAL PRIMARY KEY,
    empresa_id INT REFERENCES empresas(nit_id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    sector VARCHAR(100) NOT NULL,
    programa_objetivo VARCHAR(100),  -- Programa académico al que está dirigida
    modalidad VARCHAR(20) CHECK (modalidad IN ('presencial', 'remoto', 'hibrido')) NOT NULL,
    salario NUMERIC(10,2) CHECK (salario >= 1300000),
    requisitos TEXT,
    fecha_inicio DATE,
    duracion_meses INT CHECK (duracion_meses > 0),
    horario VARCHAR(100),
    beneficios TEXT,
    aprobada BOOLEAN DEFAULT FALSE,
    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vacantes_aprobada ON vacantes(aprobada);
CREATE INDEX idx_vacantes_programa ON vacantes(programa_objetivo);


-- ======================================
-- TABLA: solicitudes (postulaciones)
-- ======================================
CREATE TABLE IF NOT EXISTS solicitudes (
    aplicacion_id SERIAL PRIMARY KEY,
    estudiante_id INT REFERENCES estudiantes(cedula_id) ON DELETE CASCADE,
    vacante_id INT REFERENCES vacantes(vacante_id) ON DELETE CASCADE,
    hoja_vida_id INT REFERENCES hojas_vida(id),
    mensaje_postulacion TEXT,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'aceptado', 'rechazado')) DEFAULT 'pendiente',
    fecha_aplicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP,
    notas_empresa TEXT
);

CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);

-- Índice único para evitar postulaciones duplicadas
CREATE UNIQUE INDEX idx_solicitud_unica 
ON solicitudes(estudiante_id, vacante_id);


-- ======================================
-- TABLA: notificaciones
-- ======================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ======================================
-- TABLA: programas (CATÁLOGO)
-- ======================================
CREATE TABLE IF NOT EXISTS programas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    facultad VARCHAR(100),
    nivel VARCHAR(50), -- 'tecnico', 'tecnologico', 'profesional'
    activo BOOLEAN DEFAULT TRUE
);


-- ======================================
-- VISTAS
-- ======================================

-- Vista de vacantes con información completa de empresa
CREATE OR REPLACE VIEW vista_vacantes_completas AS
SELECT 
    v.vacante_id,
    v.titulo,
    v.descripcion,
    v.sector,
    v.programa_objetivo,
    v.modalidad,
    v.salario,
    v.requisitos,
    v.fecha_inicio,
    v.duracion_meses,
    v.horario,
    v.beneficios,
    v.aprobada,
    v.creada_en,
    e.nit_id,
    e.razon_social,
    e.nombre_reclutador,
    e.contacto_correo,
    e.contacto_telefono,
    u.verificado as empresa_verificada,
    -- Contar solicitudes
    COUNT(s.aplicacion_id) as total_postulaciones
FROM vacantes v
INNER JOIN empresas e ON v.empresa_id = e.nit_id
INNER JOIN usuarios u ON e.usuario_id = u.id
LEFT JOIN solicitudes s ON v.vacante_id = s.vacante_id
GROUP BY v.vacante_id, e.nit_id, e.razon_social, e.nombre_reclutador, 
         e.contacto_correo, e.contacto_telefono, u.verificado;

-- Vista de postulaciones con información completa
CREATE OR REPLACE VIEW vista_postulaciones_completas AS
SELECT 
    s.aplicacion_id,
    s.estado,
    s.mensaje_postulacion,
    s.fecha_aplicacion,
    s.fecha_respuesta,
    s.notas_empresa,
    -- Datos del estudiante
    est.cedula_id,
    u.nombre as estudiante_nombre,
    u.apellido as estudiante_apellido,
    u.correo as estudiante_correo,
    u.celular as estudiante_celular,
    est.programa,
    est.creditos_aprobados,
    est.modulo_empleabilidad,
    -- Datos de la hoja de vida
    hv.id as hoja_vida_id,
    hv.nombre_perfil,
    hv.archivo_pdf,
    hv.descripcion as hoja_descripcion,
    -- Datos de la vacante
    v.vacante_id,
    v.titulo as vacante_titulo,
    v.sector,
    v.modalidad,
    v.salario,
    -- Datos de la empresa
    e.nit_id,
    e.razon_social,
    e.nombre_reclutador
FROM solicitudes s
INNER JOIN estudiantes est ON s.estudiante_id = est.cedula_id
INNER JOIN usuarios u ON est.usuario_id = u.id
LEFT JOIN hojas_vida hv ON s.hoja_vida_id = hv.id
INNER JOIN vacantes v ON s.vacante_id = v.vacante_id
INNER JOIN empresas e ON v.empresa_id = e.nit_id;


-- ======================================
-- DATOS INICIALES
-- ======================================

-- Insertar programas de ejemplo
INSERT INTO programas (nombre, facultad, nivel) VALUES
('Ingeniería de Software', 'Ingeniería', 'profesional'),
('Tecnología en Desarrollo de Software', 'Ingeniería', 'tecnologico'),
('Ingeniería Industrial', 'Ingeniería', 'profesional'),
('Tecnología en Gestión Industrial', 'Ingeniería', 'tecnologico'),
('Diseño Gráfico', 'Diseño', 'profesional'),
('Tecnología en Diseño Visual', 'Diseño', 'tecnologico'),
('Administración de Empresas', 'Administración', 'profesional'),
('Contaduría Pública', 'Administración', 'profesional'),
('Tecnología en Gestión Comercial', 'Administración', 'tecnologico'),
('Ingeniería Electrónica', 'Ingeniería', 'profesional')
ON CONFLICT (nombre) DO NOTHING;


-- ======================================
-- INSERTAR ADMINISTRADOR POR DEFECTO
-- ======================================
-- Email: practicasprofecionalespascuali@gmail.com
-- Contraseña: Admin2025!

INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol, verificado, celular)
VALUES (
    'Administrador',
    'Sistema',
    'practicasprofecionalespascuali@gmail.com',
    '$2b$12$ZSU/tvAasitn3Z4I.HCV1uGMEc39aZCCHGsShkUOs9c1siu1trzru',  -- Admin2025!
    'administrador',
    TRUE,
    '3001234567'
) ON CONFLICT (correo) DO NOTHING;

-- Crear registro en tabla administradores
INSERT INTO administradores (usuario_id, cargo, departamento, activo)
SELECT 
    u.id,
    'Administrador del Sistema',
    'Tecnología e Innovación',
    TRUE
FROM usuarios u
WHERE u.correo = 'practicasprofecionalespascuali@gmail.com'
ON CONFLICT (usuario_id) DO NOTHING;


-- ======================================
-- COMENTARIOS SOBRE EL MODELO
-- ======================================
COMMENT ON TABLE usuarios IS 'Tabla principal de usuarios del sistema';
COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: administrador, empresa o estudiante';
COMMENT ON COLUMN usuarios.verificado IS 'Para estudiantes: verificación email. Para empresas: aprobación admin';

COMMENT ON TABLE vacantes IS 'Vacantes publicadas por empresas';
COMMENT ON COLUMN vacantes.programa_objetivo IS 'Programa académico al que está dirigida la vacante (NULL = todos los programas)';
COMMENT ON COLUMN vacantes.aprobada IS 'Las vacantes deben ser aprobadas por un administrador antes de ser visibles';

COMMENT ON TABLE hojas_vida IS 'Hojas de vida de estudiantes';
COMMENT ON COLUMN hojas_vida.es_principal IS 'Indica si esta es la hoja de vida principal del estudiante';

COMMENT ON TABLE solicitudes IS 'Postulaciones de estudiantes a vacantes';

COMMENT ON TABLE programas IS 'Catálogo de programas académicos de la institución';

COMMENT ON VIEW vista_vacantes_completas IS 'Vista completa de vacantes con información de empresa y estadísticas';
COMMENT ON VIEW vista_postulaciones_completas IS 'Vista completa de postulaciones con toda la información relacionada';


-- ======================================
-- CONSULTAS ÚTILES PARA VERIFICACIÓN
-- ======================================

-- Verificar administrador creado:
-- SELECT u.*, a.cargo, a.departamento 
-- FROM usuarios u 
-- INNER JOIN administradores a ON u.id = a.usuario_id 
-- WHERE u.rol = 'administrador';

-- Verificar programas:
-- SELECT * FROM programas ORDER BY facultad, nombre;

-- Verificar vistas:
-- SELECT * FROM vista_vacantes_completas LIMIT 5;
-- SELECT * FROM vista_postulaciones_completas LIMIT 5;