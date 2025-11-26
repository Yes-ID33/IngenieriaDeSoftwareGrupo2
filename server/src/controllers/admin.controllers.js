import pool from '../db.js';
import { enviarEmailAprobacionEmpresa, enviarEmailRechazoEmpresa } from '../utils/correo.js';

// Listar empresas pendientes de aprobación
export const listarEmpresasPendientes = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const empresasPendientes = await client.query(
      `SELECT 
        u.id as usuario_id,
        u.nombre as nombre_reclutador,
        u.correo,
        u.telefono,
        u.fecha_creacion,
        e.nit_id,
        e.razon_social,
        e.contacto_correo,
        e.contacto_telefono,
        e.creada_en
      FROM usuarios u
      INNER JOIN empresas e ON u.id = e.usuario_id
      WHERE u.rol = 'empresa' AND u.verificado = FALSE
      ORDER BY u.fecha_creacion DESC`
    );

    res.status(200).json({
      success: true,
      data: {
        total: empresasPendientes.rows.length,
        empresas: empresasPendientes.rows
      }
    });

  } catch (error) {
    console.error('Error al listar empresas pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Aprobar empresa
export const aprobarEmpresa = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params; // ID del usuario (no el NIT)

    // Verificar que la empresa existe y está pendiente
    const empresa = await client.query(
      `SELECT 
        u.id,
        u.nombre,
        u.correo,
        u.verificado,
        u.rol,
        e.razon_social
      FROM usuarios u
      INNER JOIN empresas e ON u.id = e.usuario_id
      WHERE u.id = $1`,
      [id]
    );

    if (empresa.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa no encontrada'
      });
    }

    const empresaData = empresa.rows[0];

    if (empresaData.rol !== 'empresa') {
      return res.status(400).json({
        success: false,
        message: 'El usuario no es una empresa'
      });
    }

    if (empresaData.verificado) {
      return res.status(400).json({
        success: false,
        message: 'Esta empresa ya ha sido aprobada'
      });
    }

    // Aprobar la empresa
    await client.query(
      'UPDATE usuarios SET verificado = TRUE WHERE id = $1',
      [id]
    );

    // Enviar email de aprobación
    try {
      await enviarEmailAprobacionEmpresa(
        empresaData.correo, 
        empresaData.nombre, 
        empresaData.razon_social
      );
    } catch (emailError) {
      console.error('Error enviando email de aprobación:', emailError);
      // No fallar la aprobación si no se puede enviar el email
    }

    res.status(200).json({
      success: true,
      message: `Empresa "${empresaData.razon_social}" aprobada exitosamente`,
      data: {
        usuario_id: id,
        razon_social: empresaData.razon_social,
        verificado: true
      }
    });

  } catch (error) {
    console.error('Error al aprobar empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Rechazar empresa
export const rechazarEmpresa = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { motivo } = req.body;

    // Verificar que la empresa existe
    const empresa = await client.query(
      `SELECT 
        u.id,
        u.nombre,
        u.correo,
        u.rol,
        e.razon_social
      FROM usuarios u
      INNER JOIN empresas e ON u.id = e.usuario_id
      WHERE u.id = $1`,
      [id]
    );

    if (empresa.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Empresa no encontrada'
      });
    }

    const empresaData = empresa.rows[0];

    if (empresaData.rol !== 'empresa') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'El usuario no es una empresa'
      });
    }

    // Eliminar empresa (CASCADE eliminará el usuario también)
    await client.query('DELETE FROM usuarios WHERE id = $1', [id]);

    await client.query('COMMIT');

    // ✅ ENVIAR EMAIL DE RECHAZO
    try {
      await enviarEmailRechazoEmpresa(
        empresaData.correo,
        empresaData.nombre,
        empresaData.razon_social,
        motivo
      );
    } catch (emailError) {
      console.error('Error enviando email de rechazo:', emailError);
      // No fallar el rechazo si no se puede enviar el email
    }

    res.status(200).json({
      success: true,
      message: `Empresa "${empresaData.razon_social}" rechazada y eliminada del sistema`,
      data: {
        razon_social: empresaData.razon_social,
        motivo: motivo || 'No especificado'
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al rechazar empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Listar todos los usuarios
export const listarTodosUsuarios = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const todosUsuarios = await client.query(
      `SELECT 
        id,
        nombre,
        apellido,
        correo,
        celular,
        telefono,
        rol,
        verificado,
        fecha_creacion,
        ultimo_acceso
      FROM usuarios
      ORDER BY fecha_creacion DESC`
    );

    res.status(200).json({
      success: true,
      data: {
        total: todosUsuarios.rows.length,
        usuarios: todosUsuarios.rows
      }
    });

  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Eliminar usuario
export const eliminarUsuario = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const usuario = await client.query(
      'SELECT id, nombre, apellido, rol FROM usuarios WHERE id = $1',
      [id]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const usuarioData = usuario.rows[0];

    // No permitir eliminar administradores
    if (usuarioData.rol === 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'No se pueden eliminar administradores'
      });
    }

    // Eliminar usuario (CASCADE eliminará registros relacionados)
    await client.query('DELETE FROM usuarios WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: `Usuario "${usuarioData.nombre} ${usuarioData.apellido || ''}" eliminado exitosamente`
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

export const listarTodasEmpresas = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const todasEmpresas = await client.query(
      `SELECT 
        u.id as usuario_id,
        u.nombre as nombre_reclutador,
        u.correo,
        u.verificado,
        u.fecha_creacion,
        e.nit_id,
        e.razon_social,
        e.contacto_telefono,
        e.creada_en
      FROM usuarios u
      INNER JOIN empresas e ON u.id = e.usuario_id
      WHERE u.rol = 'empresa'
      ORDER BY u.verificado ASC, u.fecha_creacion DESC`
    );

    const aprobadas = todasEmpresas.rows.filter(e => e.verificado);
    const pendientes = todasEmpresas.rows.filter(e => !e.verificado);

    res.status(200).json({
      success: true,
      data: {
        total: todasEmpresas.rows.length,
        aprobadas: aprobadas.length,
        pendientes: pendientes.length,
        empresas: todasEmpresas.rows
      }
    });

  } catch (error) {
    console.error('Error al listar empresas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// GESTIÓN DE VACANTES 
export const listarTodasVacantes = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { aprobada } = req.query;

    // Construir query con información del sector
    let query = `
      SELECT 
        v.*,
        s.nombre as sector_nombre,
        s.icono as sector_icono,
        e.razon_social,
        e.nombre_reclutador,
        e.contacto_correo,
        e.contacto_telefono,
        u.verificado as empresa_verificada,
        COUNT(sol.aplicacion_id) as total_postulaciones
      FROM vacantes v
      INNER JOIN empresas e ON v.empresa_id = e.nit_id
      INNER JOIN usuarios u ON e.usuario_id = u.id
      LEFT JOIN sectores s ON v.sector_id = s.id
      LEFT JOIN solicitudes sol ON v.vacante_id = sol.vacante_id
    `;
    
    const params = [];

    if (aprobada !== undefined) {
      query += ' WHERE v.aprobada = $1';
      params.push(aprobada === 'true');
    }

    query += ' GROUP BY v.vacante_id, e.razon_social, e.nombre_reclutador, e.contacto_correo, e.contacto_telefono, u.verificado, s.nombre, s.icono';
    query += ' ORDER BY v.creada_en DESC';

    const vacantes = await client.query(query, params);

    const pendientes = vacantes.rows.filter(v => !v.aprobada).length;
    const aprobadas = vacantes.rows.filter(v => v.aprobada).length;

    res.status(200).json({
      success: true,
      data: {
        total: vacantes.rows.length,
        pendientes,
        aprobadas,
        vacantes: vacantes.rows
      }
    });

  } catch (error) {
    console.error('Error al listar vacantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

export const aprobarVacante = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    const vacante = await client.query(
      'SELECT vacante_id, titulo, aprobada FROM vacantes WHERE vacante_id = $1',
      [id]
    );

    if (vacante.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vacante no encontrada'
      });
    }

    if (vacante.rows[0].aprobada) {
      return res.status(400).json({
        success: false,
        message: 'Esta vacante ya está aprobada'
      });
    }

    await client.query(
      'UPDATE vacantes SET aprobada = TRUE WHERE vacante_id = $1',
      [id]
    );

    res.status(200).json({
      success: true,
      message: `Vacante "${vacante.rows[0].titulo}" aprobada exitosamente`
    });

  } catch (error) {
    console.error('Error al aprobar vacante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

export const rechazarVacante = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const vacante = await client.query(
      'SELECT vacante_id, titulo FROM vacantes WHERE vacante_id = $1',
      [id]
    );

    if (vacante.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vacante no encontrada'
      });
    }

    await client.query('DELETE FROM vacantes WHERE vacante_id = $1', [id]);

    res.status(200).json({
      success: true,
      message: `Vacante "${vacante.rows[0].titulo}" rechazada y eliminada`,
      motivo: motivo || 'No especificado'
    });

  } catch (error) {
    console.error('Error al rechazar vacante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};