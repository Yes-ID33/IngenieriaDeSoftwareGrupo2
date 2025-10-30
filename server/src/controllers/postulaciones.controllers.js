import pool from '../db.js';

// Listar vacantes disponibles para el estudiante (según su programa)
export const listarVacantesDisponibles = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;
    const { programa_filtro, modalidad, salario_min } = req.query;

    // Obtener programa del estudiante
    const estudiante = await client.query(
      'SELECT cedula_id, programa FROM estudiantes WHERE usuario_id = $1',
      [usuarioId]
    );

    if (estudiante.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    const cedulaId = estudiante.rows[0].cedula_id;
    const programaEstudiante = estudiante.rows[0].programa;

    // Construir query dinámico
    let query = `
      SELECT 
        v.*,
        e.razon_social,
        e.nombre_reclutador,
        -- Verificar si el estudiante ya se postuló
        CASE WHEN s.aplicacion_id IS NOT NULL THEN TRUE ELSE FALSE END as ya_postulado,
        s.estado as estado_postulacion
      FROM vista_vacantes_completas v
      LEFT JOIN solicitudes s ON v.vacante_id = s.vacante_id AND s.estudiante_id = $1
      WHERE v.aprobada = TRUE
    `;
    const params = [cedulaId];
    let paramIndex = 2;

    // Filtrar por programa (o permitir vacantes genéricas)
    query += ` AND (v.programa_objetivo = $${paramIndex} OR v.programa_objetivo IS NULL)`;
    params.push(programaEstudiante);
    paramIndex++;

    // Filtros opcionales
    if (programa_filtro) {
      query += ` AND v.programa_objetivo = $${paramIndex}`;
      params.push(programa_filtro);
      paramIndex++;
    }

    if (modalidad && ['presencial', 'remoto', 'hibrido'].includes(modalidad)) {
      query += ` AND v.modalidad = $${paramIndex}`;
      params.push(modalidad);
      paramIndex++;
    }

    if (salario_min && !isNaN(salario_min)) {
      query += ` AND v.salario >= $${paramIndex}`;
      params.push(parseFloat(salario_min));
      paramIndex++;
    }

    query += ` ORDER BY v.creada_en DESC`;

    const vacantes = await client.query(query, params);

    res.status(200).json({
      success: true,
      data: {
        programa_estudiante: programaEstudiante,
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

// Obtener detalle de una vacante
export const obtenerDetalleVacante = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;

    // Obtener cédula del estudiante
    const estudiante = await client.query(
      'SELECT cedula_id FROM estudiantes WHERE usuario_id = $1',
      [usuarioId]
    );

    if (estudiante.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    const cedulaId = estudiante.rows[0].cedula_id;

    // Obtener vacante con información de postulación
    const vacante = await client.query(
      `SELECT 
        v.*,
        CASE WHEN s.aplicacion_id IS NOT NULL THEN TRUE ELSE FALSE END as ya_postulado,
        s.estado as estado_postulacion,
        s.fecha_aplicacion,
        s.fecha_respuesta
      FROM vista_vacantes_completas v
      LEFT JOIN solicitudes s ON v.vacante_id = s.vacante_id AND s.estudiante_id = $1
      WHERE v.vacante_id = $2 AND v.aprobada = TRUE`,
      [cedulaId, id]
    );

    if (vacante.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vacante no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: vacante.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener vacante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Postularse a una vacante
export const postularseVacante = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.usuario.id;
    const { vacante_id, hoja_vida_id, mensaje_postulacion } = req.body;

    // Validaciones
    if (!vacante_id || !hoja_vida_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Vacante y hoja de vida son obligatorias'
      });
    }

    // Obtener estudiante
    const estudiante = await client.query(
      'SELECT cedula_id, programa FROM estudiantes WHERE usuario_id = $1',
      [usuarioId]
    );

    if (estudiante.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    const cedulaId = estudiante.rows[0].cedula_id;
    const programaEstudiante = estudiante.rows[0].programa;

    // Verificar que la vacante existe y está aprobada
    const vacante = await client.query(
      'SELECT vacante_id, programa_objetivo, titulo FROM vacantes WHERE vacante_id = $1 AND aprobada = TRUE',
      [vacante_id]
    );

    if (vacante.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Vacante no encontrada o no está disponible'
      });
    }

    // Verificar que el programa coincide (si está especificado)
    const programaVacante = vacante.rows[0].programa_objetivo;
    if (programaVacante && programaVacante !== programaEstudiante) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Esta vacante es para el programa "${programaVacante}". Tu programa es "${programaEstudiante}"`
      });
    }

    // Verificar que la hoja de vida pertenece al estudiante
    const hojaVida = await client.query(
      'SELECT id FROM hojas_vida WHERE id = $1 AND estudiante_id = $2',
      [hoja_vida_id, cedulaId]
    );

    if (hojaVida.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Hoja de vida no encontrada'
      });
    }

    // Verificar que no se haya postulado antes
    const postulacionExistente = await client.query(
      'SELECT aplicacion_id FROM solicitudes WHERE estudiante_id = $1 AND vacante_id = $2',
      [cedulaId, vacante_id]
    );

    if (postulacionExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Ya te has postulado a esta vacante'
      });
    }

    // Crear postulación
    const nuevaPostulacion = await client.query(
      `INSERT INTO solicitudes (
        estudiante_id, vacante_id, hoja_vida_id, mensaje_postulacion, estado
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [cedulaId, vacante_id, hoja_vida_id, mensaje_postulacion, 'pendiente']
    );

    await client.query('COMMIT');

    // TODO: Enviar notificación a la empresa

    res.status(201).json({
      success: true,
      message: `Te has postulado exitosamente a "${vacante.rows[0].titulo}"`,
      data: nuevaPostulacion.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al postularse:', error);
    
    // Manejar error de índice único (postulación duplicada)
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya te has postulado a esta vacante'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Listar mis postulaciones
export const listarMisPostulaciones = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;
    const { estado } = req.query;

    // Obtener cédula del estudiante
    const estudiante = await client.query(
      'SELECT cedula_id FROM estudiantes WHERE usuario_id = $1',
      [usuarioId]
    );

    if (estudiante.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    const cedulaId = estudiante.rows[0].cedula_id;

    // Construir query con filtro opcional
    let query = `
      SELECT * FROM vista_postulaciones_completas
      WHERE cedula_id = $1
    `;
    const params = [cedulaId];

    if (estado && ['pendiente', 'aceptado', 'rechazado'].includes(estado)) {
      query += ` AND estado = $2`;
      params.push(estado);
    }

    query += ` ORDER BY fecha_aplicacion DESC`;

    const postulaciones = await client.query(query, params);

    // Contar por estado
    const estadisticas = await client.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'aceptado' THEN 1 END) as aceptadas,
        COUNT(CASE WHEN estado = 'rechazado' THEN 1 END) as rechazadas
      FROM solicitudes
      WHERE estudiante_id = $1`,
      [cedulaId]
    );

    res.status(200).json({
      success: true,
      data: {
        estadisticas: estadisticas.rows[0],
        postulaciones: postulaciones.rows
      }
    });

  } catch (error) {
    console.error('Error al listar postulaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Obtener detalle de una postulación
export const obtenerDetallePostulacion = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;

    // Verificar que la postulación pertenece al estudiante
    const postulacion = await client.query(
      `SELECT vp.*
       FROM vista_postulaciones_completas vp
       INNER JOIN estudiantes e ON vp.cedula_id = e.cedula_id
       WHERE vp.aplicacion_id = $1 AND e.usuario_id = $2`,
      [id, usuarioId]
    );

    if (postulacion.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Postulación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: postulacion.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener postulación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Cancelar postulación (solo si está pendiente)
export const cancelarPostulacion = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;

    // Verificar que la postulación pertenece al estudiante
    const postulacion = await client.query(
      `SELECT s.aplicacion_id, s.estado, v.titulo
       FROM solicitudes s
       INNER JOIN estudiantes e ON s.estudiante_id = e.cedula_id
       INNER JOIN vacantes v ON s.vacante_id = v.vacante_id
       WHERE s.aplicacion_id = $1 AND e.usuario_id = $2`,
      [id, usuarioId]
    );

    if (postulacion.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Postulación no encontrada'
      });
    }

    if (postulacion.rows[0].estado !== 'pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Solo puedes cancelar postulaciones pendientes'
      });
    }

    // Eliminar postulación
    await client.query(
      'DELETE FROM solicitudes WHERE aplicacion_id = $1',
      [id]
    );

    res.status(200).json({
      success: true,
      message: `Postulación cancelada exitosamente`
    });

  } catch (error) {
    console.error('Error al cancelar postulación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};