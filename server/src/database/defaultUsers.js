import pool from '../db.js';

export async function insertarDefault() {
  const adminEmail = (process.env.DB_ADMIN_CORREO).trim();
  const adminPwdHash = (process.env.DB_ADMIN_PWD).trim();
  const empresaEmail = (process.env.DB_EMPRESA_CORREO).trim();
  const empresaPwdHash = (process.env.DB_EMPRESA_PWD).trim();

  if (!adminEmail || !adminPwdHash) {
    console.warn('Faltan DB_ADMIN_CORREO o DB_ADMIN_PWD en el entorno. Saltando inserción de admin.');
  }
  if (!empresaEmail || !empresaPwdHash) {
    console.warn('Faltan DB_EMPRESA_CORREO o DB_EMPRESA_PWD en el entorno. Saltando inserción de empresa.');
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insertar administrador (si se proporcionaron email y hash)
      if (adminEmail && adminPwdHash) {
        await client.query(
          `INSERT INTO usuarios (id, nombre, apellido, correo, contrasena, rol, verificado, celular)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (correo) DO NOTHING`,
          [
            1, // id explícito para administrador
            'Administrador',
            'Sistema',
            adminEmail,
            adminPwdHash,
            'administrador',
            true,
            3001234567,
          ]
        );

        // Insertar registro en administradores asociado al usuario creado (si no existe)
        await client.query(
          `INSERT INTO administradores (usuario_id, cargo, departamento, activo)
           VALUES (
             (SELECT id FROM usuarios WHERE correo = $1),
             $2, $3, $4
           )
           ON CONFLICT (usuario_id) DO NOTHING`,
          [adminEmail, 'Administrador del Sistema', 'Tecnología e Innovación', true]
        );
      }

      // Insertar empresa ejemplo (si se proporcionaron email y hash)
      if (empresaEmail && empresaPwdHash) {
        await client.query(
          `INSERT INTO usuarios (id, nombre, apellido, correo, contrasena, rol, verificado, celular)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (correo) DO NOTHING`,
          [
            2, // id explícito para la empresa ejemplo
            'Empresa Ejemplo S.A.S.',
            'Sector Tecnológico',
            empresaEmail,
            empresaPwdHash,
            'empresa',
            true,
            3001234567,
          ]
        );

        // Insertar registro en empresas asociado al usuario creado (si no existe)
        await client.query(
          `INSERT INTO empresas (nit_id, usuario_id, razon_social, nombre_reclutador, contacto_correo, contacto_telefono)
           VALUES (
             $1,
             (SELECT id FROM usuarios WHERE correo = $2),
             $3, $4, $5, $6
           )
           ON CONFLICT (nit_id) DO NOTHING`,
          [
            900123456,
            empresaEmail,
            'Empresa Ejemplo S.A.S.',
            'Ana María Rodríguez',
            'rrhh@empresaejemplo.com',
            '3012345678',
          ]
        );
      }

      await client.query(`
        SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios) + 1)
      `);

      await client.query('COMMIT');
      console.log('Inserción de usuarios por defecto completada.');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error al insertar usuarios por defecto. Se hizo ROLLBACK:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error de conexión al intentar insertar usuarios por defecto:', err);
  }
}
