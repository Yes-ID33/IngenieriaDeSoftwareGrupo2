import pool from '../db.js';

// ==========================================
// CONTROLADORES PARA EMPRESAS
// ==========================================

// Crear vacante (solo empresas verificadas)
export const crearVacante = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;
    
    const {
      titulo,
      descripcion,
      sector_id,
      programa_objetivo,
      modalidad,
      salario,
      requisitos,
      fecha_inicio,
      duracion_meses,
      horario,
      beneficios
    } = req.body;

    // Obtener nombre del sector desde la tabla sectores
    const sectorRes = await client.query(
      'SELECT nombre FROM sectores WHERE id = $1',
      [sector_id]
    );
    if (sectorRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Sector inválido' });
    }
    const sectorNombre = sectorRes.rows[0].nombre;

    // Validaciones
    if (!titulo || !sector_id || !modalidad || !salario || !sectorNombre) {
      return res.status(400).json({
        success: false,
        message: 'Los campos título, sector, modalidad y salario son obligatorios'
      });
    }

    // Verificar que el usuario es una empresa verificada
    const empresa = await client.query(
      `SELECT e.nit_id, u.verificado 
       FROM empresas e
       INNER JOIN usuarios u ON e.usuario_id = u.id
       WHERE e.usuario_id = $1`,
      [usuarioId]
    );

    if (empresa.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para crear vacantes'
      });
    }

    if (!empresa.rows[0].verificado) {
      return res.status(403).json({
        success: false,
        message: 'Tu empresa debe estar verificada para publicar vacantes'
      });
    }

    const empresaId = empresa.rows[0].nit_id;

    // Validar salario mínimo
    if (salario < 1300000) {
      return res.status(400).json({
        success: false,
        message: 'El salario debe ser al menos $1,300,000'
      });
    }

    // Insertar vacante (aprobada = false, requiere aprobación de admin)
    const nuevaVacante = await client.query(
      `INSERT INTO vacantes (
        empresa_id, titulo, descripcion, sector, sector_id, programa_objetivo,
        modalidad, salario, requisitos, fecha_inicio, duracion_meses,
        horario, beneficios, aprobada
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        empresaId, titulo, descripcion, sectorNombre, sector_id, programa_objetivo,
        modalidad, salario, requisitos, fecha_inicio, duracion_meses,
        horario, beneficios, false
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Vacante creada exitosamente. Pendiente de aprobación por administrador.',
      data: nuevaVacante.rows[0]
    });

  } catch (error) {
    console.error('Error al crear vacante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Listar vacantes de mi empresa
export const listarMisVacantes = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;

    // Obtener NIT de la empresa
    const empresa = await client.query(
      'SELECT nit_id FROM empresas WHERE usuario_id = $1',
      [usuarioId]
    );

    if (empresa.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa no encontrada'
      });
    }

    const empresaId = empresa.rows[0].nit_id;

    // Obtener vacantes con información del sector
    const vacantes = await client.query(
      `SELECT 
        v.*,
        s.nombre as sector_nombre,
        s.icono as sector_icono,
        COUNT(sol.aplicacion_id) as total_postulaciones,
        COUNT(CASE WHEN sol.estado = 'pendiente' THEN 1 END) as postulaciones_pendientes,
        COUNT(CASE WHEN sol.estado = 'aceptado' THEN 1 END) as postulaciones_aceptadas,
        COUNT(CASE WHEN sol.estado = 'rechazado' THEN 1 END) as postulaciones_rechazadas
      FROM vacantes v
      LEFT JOIN sectores s ON v.sector_id = s.id
      LEFT JOIN solicitudes sol ON v.vacante_id = sol.vacante_id
      WHERE v.empresa_id = $1
      GROUP BY v.vacante_id, s.nombre, s.icono
      ORDER BY v.creada_en DESC`,
      [empresaId]
    );

    res.status(200).json({
      success: true,
      data: {
        total: vacantes.rows.length,
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

// Actualizar vacante - CORREGIDO: eliminada variable "sector" no utilizada
export const actualizarVacante = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;

    // Verificar que la vacante pertenece a la empresa
    const vacante = await client.query(
      `SELECT v.vacante_id 
       FROM vacantes v
       INNER JOIN empresas e ON v.empresa_id = e.nit_id
       WHERE v.vacante_id = $1 AND e.usuario_id = $2`,
      [id, usuarioId]
    );

    if (vacante.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vacante no encontrada o no tienes permisos para editarla'
      });
    }

    // SOLUCIÓN: Eliminada la variable "sector" que no se usaba
    const {
      titulo,
      descripcion,
      programa_objetivo,
      modalidad,
      salario,
      requisitos,
      fecha_inicio,
      duracion_meses,
      horario,
      beneficios
    } = req.body;

    // Actualizar vacante
    const vacanteActualizada = await client.query(
      `UPDATE vacantes SET
        titulo = COALESCE($1, titulo),
        descripcion = COALESCE($2, descripcion),
        programa_objetivo = COALESCE($3, programa_objetivo),
        modalidad = COALESCE($4, modalidad),
        salario = COALESCE($5, salario),
        requisitos = COALESCE($6, requisitos),
        fecha_inicio = COALESCE($7, fecha_inicio),
        duracion_meses = COALESCE($8, duracion_meses),
        horario = COALESCE($9, horario),
        beneficios = COALESCE($10, beneficios)
      WHERE vacante_id = $11
      RETURNING *`,
      [
        titulo, descripcion, programa_objetivo, modalidad,
        salario, requisitos, fecha_inicio, duracion_meses, horario,
        beneficios, id
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Vacante actualizada exitosamente',
      data: vacanteActualizada.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar vacante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Eliminar vacante
export const eliminarVacante = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;

    // Verificar que la vacante pertenece a la empresa
    const vacante = await client.query(
      `SELECT v.vacante_id, v.titulo
       FROM vacantes v
       INNER JOIN empresas e ON v.empresa_id = e.nit_id
       WHERE v.vacante_id = $1 AND e.usuario_id = $2`,
      [id, usuarioId]
    );

    if (vacante.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vacante no encontrada o no tienes permisos para eliminarla'
      });
    }

    await client.query(
      'DELETE FROM vacantes WHERE vacante_id = $1',
      [id]
    );

    res.status(200).json({
      success: true,
      message: `Vacante "${vacante.rows[0].titulo}" eliminada exitosamente`
    });

  } catch (error) {
    console.error('Error al eliminar vacante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Ver postulaciones de una vacante específica
export const verPostulacionesVacante = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;
    const { estado } = req.query; // Filtro opcional por estado

    // Verificar que la vacante pertenece a la empresa
    const vacante = await client.query(
      `SELECT v.vacante_id 
       FROM vacantes v
       INNER JOIN empresas e ON v.empresa_id = e.nit_id
       WHERE v.vacante_id = $1 AND e.usuario_id = $2`,
      [id, usuarioId]
    );

    if (vacante.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vacante no encontrada'
      });
    }

    // Construir query con filtro opcional
    let query = `
      SELECT * FROM vista_postulaciones_completas
      WHERE vacante_id = $1
    `;
    const params = [id];

    if (estado && ['pendiente', 'aceptado', 'rechazado'].includes(estado)) {
      query += ` AND estado = $2`;
      params.push(estado);
    }

    query += ` ORDER BY fecha_aplicacion DESC`;

    const postulaciones = await client.query(query, params);

    res.status(200).json({
      success: true,
      data: {
        vacante_id: id,
        total: postulaciones.rows.length,
        postulaciones: postulaciones.rows
      }
    });

  } catch (error) {
    console.error('Error al ver postulaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Responder a una postulación (aceptar o rechazar)
export const responderPostulacion = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params; // ID de la solicitud
    const { estado, notas_empresa } = req.body;

    // Validar estado
    if (!['aceptado', 'rechazado'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser "aceptado" o "rechazado"'
      });
    }

    // Verificar que la postulación pertenece a una vacante de la empresa
    const solicitud = await client.query(
      `SELECT s.aplicacion_id, s.estado, v.titulo
       FROM solicitudes s
       INNER JOIN vacantes v ON s.vacante_id = v.vacante_id
       INNER JOIN empresas e ON v.empresa_id = e.nit_id
       WHERE s.aplicacion_id = $1 AND e.usuario_id = $2`,
      [id, usuarioId]
    );

    if (solicitud.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Postulación no encontrada'
      });
    }

    if (solicitud.rows[0].estado !== 'pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Esta postulación ya fue respondida'
      });
    }

    // Actualizar estado
    const actualizada = await client.query(
      `UPDATE solicitudes 
       SET estado = $1, notas_empresa = $2, fecha_respuesta = CURRENT_TIMESTAMP
       WHERE aplicacion_id = $3
       RETURNING *`,
      [estado, notas_empresa, id]
    );

    // TODO: Enviar notificación al estudiante por correo

    res.status(200).json({
      success: true,
      message: `Postulación ${estado === 'aceptado' ? 'aceptada' : 'rechazada'} exitosamente`,
      data: actualizada.rows[0]
    });

  } catch (error) {
    console.error('Error al responder postulación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// ==========================================
// CONTROLADOR PÚBLICO (para listar vacantes)
// ==========================================

export const listarVacantesConEmpresa = async (req, res) => {
  const client = await pool.connect();
  try {
    const resultado = await client.query(` 
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
        e.razon_social,
        e.nombre_reclutador,
        e.contacto_correo,
        e.contacto_telefono
      FROM vacantes v
      INNER JOIN empresas e ON v.empresa_id = e.nit_id
      WHERE v.aprobada = TRUE
      ORDER BY v.creada_en DESC
    `);

    res.status(200).json({
      success: true,
      data: {
        total: resultado.rows.length,
        vacantes: resultado.rows
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