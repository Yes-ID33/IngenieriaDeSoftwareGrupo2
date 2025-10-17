import pool from '../db.js';
import bcrypt from 'bcrypt';
import { enviarEmailRegistroEmpresa } from '../middleware/correo.js';

// Registrar empresa
export const registrarEmpresa = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { 
      nit,
      razon_social,
      nombre_reclutador,
      contacto_correo,
      contacto_telefono,
      contrasena
    } = req.body;
   
    // Validaciones básicas
    if (!nit || !razon_social || !nombre_reclutador || !contacto_correo || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos obligatorios deben ser completados'
      });
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contacto_correo)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del correo electrónico no es válido'
      });
    }

    // Validar contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(contrasena)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
      });
    }

    // Validar NIT (números)
    if (isNaN(nit) || nit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El NIT debe ser un número válido'
      });
    }

    // Verificar si el correo ya existe
    const correoExistente = await client.query(
      'SELECT id FROM usuarios WHERE correo = $1',
      [contacto_correo]
    );

    if (correoExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }

    // Verificar si el NIT ya existe
    const nitExistente = await client.query(
      'SELECT nit_id FROM empresas WHERE nit_id = $1',
      [nit]
    );

    if (nitExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'El NIT ya está registrado en el sistema'
      });
    }

    // Encriptar contraseña
    const saltRounds = 12;
    const contrasenaHasheada = await bcrypt.hash(contrasena, saltRounds);

    // Insertar usuario (verificado = FALSE, esperando aprobación del admin)
    const nuevoUsuario = await client.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, telefono, rol, verificado)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nombre, correo, rol, fecha_creacion`,
      [nombre_reclutador, contacto_correo, contrasenaHasheada, contacto_telefono, 'empresa', false]
    );

    const usuarioId = nuevoUsuario.rows[0].id;

    // Insertar en tabla empresas
    await client.query(
      `INSERT INTO empresas (nit_id, usuario_id, razon_social, nombre_reclutador, contacto_correo, contacto_telefono)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [nit, usuarioId, razon_social, nombre_reclutador, contacto_correo, contacto_telefono]
    );

    // Enviar email de confirmación de registro
    try {
      await enviarEmailRegistroEmpresa(contacto_correo, nombre_reclutador, razon_social);
    } catch (emailError) {
      console.error('Error enviando email a empresa:', emailError);
      // No fallar el registro si no se puede enviar el email
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Empresa registrada exitosamente. Tu cuenta será revisada por un administrador.',
      data: {
        usuario: nuevoUsuario.rows[0],
        nit: nit,
        razon_social: razon_social,
        mensaje_adicional: 'Recibirás un correo electrónico cuando tu cuenta sea aprobada (24-48 horas hábiles).'
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};