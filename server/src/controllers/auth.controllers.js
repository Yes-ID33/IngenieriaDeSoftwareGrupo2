import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Login unificado para todos los roles
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
      'SELECT id, nombre, apellido, celular, correo, contrasena, rol, verificado FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (usuario.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const usuarioData = usuario.rows[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(contrasena, usuarioData.contrasena);
    
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si la cuenta está verificada/aprobada
    if (!usuarioData.verificado) {
      // Mensajes personalizados según el rol
      let mensaje = '';
      let codigo = '';

      if (usuarioData.rol === 'estudiante') {
        mensaje = 'Debes verificar tu cuenta antes de iniciar sesión. Revisa tu correo electrónico.';
        codigo = 'CUENTA_NO_VERIFICADA';
      } else if (usuarioData.rol === 'empresa') {
        mensaje = 'Tu cuenta está pendiente de aprobación por un administrador. Te notificaremos por correo cuando sea aprobada.';
        codigo = 'CUENTA_PENDIENTE_APROBACION';
      }

      return res.status(403).json({
        success: false,
        message: mensaje,
        codigo: codigo
      });
    }

    // Obtener información adicional según el rol
    let datosAdicionales = {};

    if (usuarioData.rol === 'estudiante') {
      const estudiante = await client.query(
        'SELECT cedula_id, creditos_aprobados, modulo_empleabilidad FROM estudiantes WHERE usuario_id = $1',
        [usuarioData.id]
      );
      datosAdicionales = estudiante.rows[0] || {};
    } else if (usuarioData.rol === 'empresa') {
      const empresa = await client.query(
        'SELECT nit_id, razon_social, nombre_reclutador FROM empresas WHERE usuario_id = $1',
        [usuarioData.id]
      );
      datosAdicionales = empresa.rows[0] || {};
    } else if (usuarioData.rol === 'administrador') {
      const admin = await client.query(
        'SELECT admin_id, cargo, departamento FROM administradores WHERE usuario_id = $1',
        [usuarioData.id]
      );
      datosAdicionales = admin.rows[0] || {};
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
        nombre: usuarioData.nombre,
        rol: usuarioData.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // SOLUCIÓN CORREGIDA: Usar el patrón de exclusión sin crear variable no utilizada
    const { contrasena: _, ...usuarioSinPassword } = usuarioData;

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        usuario: {
          ...usuarioSinPassword,
          ...datosAdicionales
        }
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

// Obtener perfil de usuario autenticado
export const obtenerPerfil = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.usuario.id;

    const usuario = await client.query(
      'SELECT id, nombre, apellido, celular, correo, telefono, rol, fecha_creacion, verificado, ultimo_acceso FROM usuarios WHERE id = $1',
      [userId]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const usuarioData = usuario.rows[0];
    let datosAdicionales = {};

    // Obtener datos adicionales según el rol
    if (usuarioData.rol === 'estudiante') {
      const estudiante = await client.query(
        'SELECT cedula_id, creditos_aprobados, modulo_empleabilidad FROM estudiantes WHERE usuario_id = $1',
        [userId]
      );
      datosAdicionales = estudiante.rows[0] || {};
    } else if (usuarioData.rol === 'empresa') {
      const empresa = await client.query(
        'SELECT nit_id, razon_social, nombre_reclutador, contacto_correo, contacto_telefono, creada_en FROM empresas WHERE usuario_id = $1',
        [userId]
      );
      datosAdicionales = empresa.rows[0] || {};
    } else if (usuarioData.rol === 'administrador') {
      const admin = await client.query(
        'SELECT admin_id, cargo, departamento, activo FROM administradores WHERE usuario_id = $1',
        [userId]
      );
      datosAdicionales = admin.rows[0] || {};
    }

    res.status(200).json({
      success: true,
      data: {
        usuario: {
          ...usuarioData,
          ...datosAdicionales
        }
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