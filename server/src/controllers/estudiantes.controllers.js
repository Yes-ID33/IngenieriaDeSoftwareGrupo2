import pool from '../db.js';
import bcrypt from 'bcrypt';
import { enviarEmailVerificacion, enviarEmailBienvenida, generarTokenVerificacion } from '../utils/correo.js';

// Registrar estudiante
export const registrarEstudiante = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { 
      nombre, 
      apellido, 
      celular, 
      correo, 
      contrasena,
      cedula,
      programa,
      creditos_aprobados,
      modulo_empleabilidad
    } = req.body;
   
    // Validaciones básicas
    if (!nombre || !apellido || !celular || !correo || !contrasena || !cedula || !programa) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos obligatorios deben ser completados'
      });
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del correo electrónico no es válido'
      });
    }

      // VALIDAR DOMINIO INSTITUCIONAL
    const dominioInstitucional = '@pascualbravo.edu.co';
    if (!correo.toLowerCase().endsWith(dominioInstitucional)) {
      return res.status(400).json({
        success: false,
        message: `El correo debe ser institucional (${dominioInstitucional})`
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

    // Validar celular (10 dígitos)
    const celularRegex = /^\d{10}$/;
    if (!celularRegex.test(celular)) {
      return res.status(400).json({
        success: false,
        message: 'El celular debe tener 10 dígitos'
      });
    }

    // Validar cédula (números)
    if (Number.isNaN(cedula) || cedula <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cédula debe ser un número válido'
      });
    }

    // Verificar si el correo ya existe
    const correoExistente = await client.query(
      'SELECT id, verificado FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (correoExistente.rows.length > 0) {
      const usuario = correoExistente.rows[0];
      if (usuario.verificado) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: 'El correo electrónico ya está registrado y verificado'
        });
      } else {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: 'El correo ya está registrado pero no verificado. Revisa tu bandeja de entrada o solicita un nuevo código.'
        });
      }
    }

    // Verificar si la cédula ya existe
    const cedulaExistente = await client.query(
      'SELECT cedula_id FROM estudiantes WHERE cedula_id = $1',
      [cedula]
    );

    if (cedulaExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'La cédula ya está registrada en el sistema'
      });
    }

    // Encriptar contraseña
    const saltRounds = 12;
    const contrasenaHasheada = await bcrypt.hash(contrasena, saltRounds);

    // Generar token de verificación
    const tokenVerificacion = generarTokenVerificacion();
    const tokenExpira = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Insertar usuario
    const nuevoUsuario = await client.query(
      `INSERT INTO usuarios (nombre, apellido, celular, correo, contrasena, rol, verificado, token_verificacion, token_expira)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, nombre, apellido, celular, correo, rol, fecha_creacion`,
      [nombre, apellido, celular, correo, contrasenaHasheada, 'estudiante', false, tokenVerificacion, tokenExpira]
    );

    const usuarioId = nuevoUsuario.rows[0].id;

    // Insertar en tabla estudiantes
    await client.query(
      `INSERT INTO estudiantes (cedula_id, usuario_id, programa, creditos_aprobados, modulo_empleabilidad)
       VALUES ($1, $2, $3, $4, $5)`,
      [cedula, usuarioId, programa, creditos_aprobados || 0, modulo_empleabilidad || false]
    );

    // Enviar email de verificación
    try {
      await enviarEmailVerificacion(correo, nombre, tokenVerificacion);
    } catch (emailError) {
      await client.query('ROLLBACK');
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el correo de verificación. Intenta nuevamente.'
      });
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Estudiante registrado exitosamente. Revisa tu correo electrónico para verificar tu cuenta.',
      data: {
        usuario: nuevoUsuario.rows[0],
        cedula: cedula,
        mensaje_adicional: 'Se ha enviado un código de verificación a tu correo. El código expira en 15 minutos.'
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar estudiante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Verificar cuenta de estudiante
export const verificarCuentaEstudiante = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { correo, token } = req.body;

    if (!correo || !token) {
      return res.status(400).json({
        success: false,
        message: 'Correo y código de verificación son obligatorios'
      });
    }

    const usuario = await client.query(
      'SELECT id, nombre, apellido, token_verificacion, token_expira, verificado, rol FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró una cuenta asociada a este correo'
      });
    }

    const usuarioData = usuario.rows[0];

    if (usuarioData.rol !== 'estudiante') {
      return res.status(400).json({
        success: false,
        message: 'Esta cuenta no es de estudiante'
      });
    }

    if (usuarioData.verificado) {
      return res.status(400).json({
        success: false,
        message: 'Esta cuenta ya ha sido verificada. Puedes iniciar sesión.'
      });
    }

    if (usuarioData.token_verificacion !== token) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificación incorrecto'
      });
    }

    if (new Date() > new Date(usuarioData.token_expira)) {
      return res.status(400).json({
        success: false,
        message: 'El código de verificación ha expirado. Solicita uno nuevo.'
      });
    }

    // Activar cuenta
    await client.query(
      'UPDATE usuarios SET verificado = $1, token_verificacion = NULL, token_expira = NULL WHERE id = $2',
      [true, usuarioData.id]
    );

    // Enviar email de bienvenida
    try {
      await enviarEmailBienvenida(correo, usuarioData.nombre);
    } catch (emailError) {
      console.error('Error enviando email de bienvenida:', emailError);
    }

    res.status(200).json({
      success: true,
      message: '¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.',
      data: {
        verificado: true,
        nombre: usuarioData.nombre
      }
    });

  } catch (error) {
    console.error('Error al verificar cuenta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Reenviar código de verificación
export const reenviarCodigoEstudiante = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico es obligatorio'
      });
    }

    const usuario = await client.query(
      'SELECT id, nombre, verificado, rol FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró una cuenta asociada a este correo'
      });
    }

    const usuarioData = usuario.rows[0];

    if (usuarioData.rol !== 'estudiante') {
      return res.status(400).json({
        success: false,
        message: 'Esta función solo está disponible para estudiantes'
      });
    }

    if (usuarioData.verificado) {
      return res.status(400).json({
        success: false,
        message: 'Esta cuenta ya está verificada. Puedes iniciar sesión.'
      });
    }

    // Generar nuevo token
    const nuevoToken = generarTokenVerificacion();
    const nuevaExpiracion = new Date(Date.now() + 15 * 60 * 1000);

    await client.query(
      'UPDATE usuarios SET token_verificacion = $1, token_expira = $2 WHERE id = $3',
      [nuevoToken, nuevaExpiracion, usuarioData.id]
    );

    // Enviar nuevo email
    await enviarEmailVerificacion(correo, usuarioData.nombre, nuevoToken);

    res.status(200).json({
      success: true,
      message: 'Se ha enviado un nuevo código de verificación a tu correo electrónico.'
    });

  } catch (error) {
    console.error('Error al reenviar código:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};