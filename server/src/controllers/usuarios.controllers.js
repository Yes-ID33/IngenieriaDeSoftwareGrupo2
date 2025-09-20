import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { enviarEmailVerificacion, enviarEmailBienvenida, generarTokenVerificacion } from '../middleware/correo.js';

// Registrar usuario
export const registrarUsuario = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { nombre, apellido, celular, correo, contrasena } = req.body;

   
    if (!nombre || !apellido || !celular || !correo || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
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

    // Validar contraseña (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(contrasena)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
      });
    }

    // Validar formato de celular (10 dígitos)
    const celularRegex = /^\d{10}$/;
    if (!celularRegex.test(celular)) {
      return res.status(400).json({
        success: false,
        message: 'El celular debe tener 10 dígitos'
      });
    }

    // Verificar si el correo ya existe
    const usuarioExistente = await client.query(
      'SELECT id, verificado FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (usuarioExistente.rows.length > 0) {
      const usuario = usuarioExistente.rows[0];
      if (usuario.verificado) {
        return res.status(409).json({
          success: false,
          message: 'El correo electrónico ya está registrado y verificado'
        });
      } else {
        return res.status(409).json({
          success: false,
          message: 'El correo ya está registrado pero no verificado. Revisa tu bandeja de entrada o solicita un nuevo código.'
        });
      }
    }

    // Encriptar contraseña
    const saltRounds = 12;
    const contrasenaHasheada = await bcrypt.hash(contrasena, saltRounds);

    // Generar token de verificación y fecha de expiración (15 minutos)
    const tokenVerificacion = generarTokenVerificacion();
    const tokenExpira = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Insertar nuevo usuario (no verificado)
    const nuevoUsuario = await client.query(
      `INSERT INTO usuarios (nombre, apellido, celular, correo, contrasena, verificado, token_verificacion, token_expira) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, nombre, apellido, celular, correo, fecha_creacion`,
      [nombre, apellido, celular, correo, contrasenaHasheada, false, tokenVerificacion, tokenExpira]
    );

    // Enviar email de verificación
    try {
      await enviarEmailVerificacion(correo, nombre, tokenVerificacion);
    } catch (emailError) {
      // Si no se puede enviar el email, eliminar el usuario creado
      await client.query('DELETE FROM usuarios WHERE id = $1', [nuevoUsuario.rows[0].id]);
      
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el correo de verificación. Intenta nuevamente.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Revisa tu correo electrónico para verificar tu cuenta.',
      data: {
        usuario: nuevoUsuario.rows[0],
        mensaje_adicional: 'Se ha enviado un código de verificación a tu correo. El código expira en 15 minutos.'
      }
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Verificar cuenta con token del email
export const verificarCuenta = async (req, res) => {
  const client = await pool.connect();

  try {
    const { correo, token } = req.body;

    if (!correo || !token) {
      return res.status(400).json({
        success: false,
        message: 'Correo y código de verificación son obligatorios'
      });
    }

    // Buscar usuario con el token
    const usuario = await client.query(
      'SELECT id, nombre, apellido, token_verificacion, token_expira, verificado FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró una cuenta asociada a este correo'
      });
    }

    const usuarioData = usuario.rows[0];

    // Verificar si la cuenta ya está verificada
    if (usuarioData.verificado) {
      return res.status(400).json({
        success: false,
        message: 'Esta cuenta ya ha sido verificada. Puedes iniciar sesión.'
      });
    }

    // Verificar si el token coincide
    if (usuarioData.token_verificacion !== token) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificación incorrecto'
      });
    }

    // Verificar si el token ha expirado
    if (new Date() > new Date(usuarioData.token_expira)) {
      return res.status(400).json({
        success: false,
        message: 'El código de verificación ha expirado. Solicita uno nuevo.'
      });
    }

    // Activar la cuenta
    await client.query(
      'UPDATE usuarios SET verificado = $1, token_verificacion = NULL, token_expira = NULL WHERE id = $2',
      [true, usuarioData.id]
    );

    // Enviar email de bienvenida
    try {
      await enviarEmailBienvenida(correo, usuarioData.nombre);
    } catch (emailError) {
      console.error('Error enviando email de bienvenida:', emailError);
      // No fallar si no se puede enviar el email de bienvenida
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
export const reenviarCodigoVerificacion = async (req, res) => {
  const client = await pool.connect();

  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico es obligatorio'
      });
    }

    // Buscar usuario
    const usuario = await client.query(
      'SELECT id, nombre, verificado FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró una cuenta asociada a este correo'
      });
    }

    const usuarioData = usuario.rows[0];

    if (usuarioData.verificado) {
      return res.status(400).json({
        success: false,
        message: 'Esta cuenta ya está verificada. Puedes iniciar sesión.'
      });
    }

    // Generar nuevo token y actualizar
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

// Iniciar sesión (solo usuarios verificados)
export const iniciarSesion = async (req, res) => {
  const client = await pool.connect();

  try {
    const { correo, contrasena } = req.body;

    // Validaciones básicas
    if (!correo || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Correo y contraseña son obligatorios'
      });
    }

    // Buscar usuario por correo
    const usuario = await client.query(
      'SELECT id, nombre, apellido, celular, correo, contrasena, verificado FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (usuario.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const usuarioData = usuario.rows[0];

    // Verificar si la cuenta está verificada
    if (!usuarioData.verificado) {
      return res.status(403).json({
        success: false,
        message: 'Debes verificar tu cuenta antes de iniciar sesión. Revisa tu correo electrónico.',
        codigo: 'CUENTA_NO_VERIFICADA'
      });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(contrasena, usuarioData.contrasena);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar último acceso
    await client.query(
      'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
      [usuarioData.id]
    );

    // Generar JWT
    const token = jwt.sign(
      {
        id: usuarioData.id,
        correo: usuarioData.correo,
        nombre: usuarioData.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remover contraseña de la respuesta
    const { contrasena: _, ...usuarioSinPassword } = usuarioData;

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        usuario: usuarioSinPassword
      }
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Obtener perfil de usuario (requiere token)
export const obtenerPerfil = async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.usuario.id;

    const usuario = await client.query(
      'SELECT id, nombre, apellido, celular, correo, fecha_creacion, verificado, ultimo_acceso FROM usuarios WHERE id = $1',
      [userId]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        usuario: usuario.rows[0]
      }
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};