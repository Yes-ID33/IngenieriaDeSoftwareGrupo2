CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    celular VARCHAR(20) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(255),
    token_expira TIMESTAMP,
    ultimo_acceso TIMESTAMP
);

INSERT INTO usuarios (nombre, apellido, celular, correo, contrasena)
VALUES ('Angelo', 'Arango', '3014238770', 'angelo@example.com', '1234');
