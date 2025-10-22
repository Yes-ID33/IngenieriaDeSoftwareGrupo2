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
    archivo_pdf VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ======================================
-- TABLA: vacantes
-- ======================================
CREATE TABLE IF NOT EXISTS vacantes (
    vacante_id SERIAL PRIMARY KEY,
    empresa_id INT REFERENCES empresas(nit_id) ON DELETE CASCADE,
    sector VARCHAR(100) NOT NULL,
    modalidad VARCHAR(20) CHECK (modalidad IN ('presencial', 'remoto', 'hibrido')) NOT NULL,
    salario NUMERIC(10,2) CHECK (salario >= 1300000),
    requisitos VARCHAR(1000),
    aprobada BOOLEAN DEFAULT FALSE,
    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vacantes_aprobada ON vacantes(aprobada);


-- ======================================
-- TABLA: solicitudes (postulaciones)
-- ======================================
CREATE TABLE IF NOT EXISTS solicitudes (
    aplicacion_id SERIAL PRIMARY KEY,
    estudiante_id INT REFERENCES estudiantes(cedula_id) ON DELETE CASCADE,
    vacante_id INT REFERENCES vacantes(vacante_id) ON DELETE CASCADE,
    hoja_vida_id INT REFERENCES hojas_vida(id),
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'aceptado', 'rechazado')) DEFAULT 'pendiente',
    fecha_aplicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);


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
-- CONSULTA PARA VERIFICAR ADMIN CREADO
-- ======================================
-- SELECT u.*, a.cargo, a.departamento 
-- FROM usuarios u 
-- INNER JOIN administradores a ON u.id = a.usuario_id 
-- WHERE u.rol = 'administrador';