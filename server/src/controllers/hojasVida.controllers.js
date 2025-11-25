import pool from '../db.js';

const parseHabilidades = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(h => String(h).trim()).filter(Boolean);
  if (typeof raw === 'string') {
    // intenta JSON.parse, si falla usa CSV
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(h => String(h).trim()).filter(Boolean);
    } catch (e) { /* no es JSON */ }
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const getColumnLimits = async (client, table) => {
  const q = `
    SELECT column_name, character_maximum_length
    FROM information_schema.columns
    WHERE table_name = $1 AND character_maximum_length IS NOT NULL;
  `;
  const r = await client.query(q, [table]);
  return r.rows.reduce((acc, row) => {
    acc[row.column_name] = row.character_maximum_length;
    return acc;
  }, {});
};

// Crear hoja de vida
export const crearHojaVida = async (req, res) => {
  const client = await pool.connect();
  try {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) return res.status(401).json({ success: false, message: 'No autenticado' });

    const {
      nombre_perfil = '',
      descripcion = '',
      habilidades,
      experiencia = '',
      educacion = '',
      es_principal = false
    } = req.body;

    // parse y normalización
    const habilidadesNormalized = parseHabilidades(habilidades);

    // consulta límites de columnas (si la tabla tiene restricciones)
    const limits = await getColumnLimits(client, 'hojas_vida');

    const tooLong = [];
    const checkField = (key, value) => {
      if (value == null) return;
      const s = String(value);
      const max = limits[key];
      if (max && s.length > max) tooLong.push({ field: key, length: s.length, max });
    };

    checkField('nombre_perfil', nombre_perfil);
    checkField('descripcion', descripcion);
    checkField('experiencia', experiencia);
    checkField('educacion', educacion);
    // no check para habilidades array aquí (pg convierte), pero puedes validar items:
    habilidadesNormalized.forEach((h, i) => {
      if (limits['habilidades'] && h.length > limits['habilidades']) {
        tooLong.push({ field: `habilidades[${i}]`, length: h.length, max: limits['habilidades'] });
      }
    });

    if (tooLong.length) {
      return res.status(400).json({ success: false, message: 'Campos demasiado largos', details: tooLong });
    }

    const insertQuery = `
      INSERT INTO hojas_vida
        (usuario_id, nombre_perfil, descripcion, habilidades, experiencia, educacion, archivo_url, es_principal)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      usuarioId,
      nombre_perfil,
      descripcion,
      habilidadesNormalized, // node-postgres convierte JS array a text[]
      experiencia,
      educacion,
      null, // no guardamos URL ahora
      es_principal
    ];

    const result = await client.query(insertQuery, values);
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al crear hoja de vida:', error);
    if (error && error.code === '22P02') {
      return res.status(400).json({ success: false, message: 'Formato inválido en campos (habilidades). Envía un array o CSV.' });
    }
    if (error && error.code === '22001') {
      return res.status(400).json({ success: false, message: 'Algún campo excede la longitud permitida.' });
    }
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  } finally {
    client.release();
  }
};

// Listar mis hojas de vida
export const listarMisHojasVida = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;

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

    // Obtener hojas de vida con conteo de usos
    const hojas = await client.query(
      `SELECT 
        hv.*,
        COUNT(s.aplicacion_id) as veces_usada
      FROM hojas_vida hv
      LEFT JOIN solicitudes s ON hv.id = s.hoja_vida_id
      WHERE hv.estudiante_id = $1
      GROUP BY hv.id
      ORDER BY hv.es_principal DESC, hv.fecha_creacion DESC`,
      [cedulaId]
    );

    res.status(200).json({
      success: true,
      data: {
        total: hojas.rows.length,
        hojas_vida: hojas.rows
      }
    });

  } catch (error) {
    console.error('Error al listar hojas de vida:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Obtener una hoja de vida específica
export const obtenerHojaVida = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;

    // Verificar que la hoja pertenece al estudiante
    const hoja = await client.query(
      `SELECT hv.*
       FROM hojas_vida hv
       INNER JOIN estudiantes e ON hv.estudiante_id = e.cedula_id
       WHERE hv.id = $1 AND e.usuario_id = $2`,
      [id, usuarioId]
    );

    if (hoja.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hoja de vida no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: hoja.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener hoja de vida:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Actualizar hoja de vida
export const actualizarHojaVida = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;

    // Verificar que la hoja pertenece al estudiante
    const hoja = await client.query(
      `SELECT hv.id, hv.estudiante_id
       FROM hojas_vida hv
       INNER JOIN estudiantes e ON hv.estudiante_id = e.cedula_id
       WHERE hv.id = $1 AND e.usuario_id = $2`,
      [id, usuarioId]
    );

    if (hoja.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hoja de vida no encontrada'
      });
    }

    const {
      nombre_perfil,
      descripcion,
      habilidades,
      experiencia,
      educacion,
      es_principal
    } = req.body;

    // Si se marca como principal, desmarcar otras
    if (es_principal) {
      await client.query(
        'UPDATE hojas_vida SET es_principal = FALSE WHERE estudiante_id = $1 AND id != $2',
        [hoja.rows[0].estudiante_id, id]
      );
    }

    // Actualizar hoja
    const actualizada = await client.query(
      `UPDATE hojas_vida SET
        nombre_perfil = COALESCE($1, nombre_perfil),
        descripcion = COALESCE($2, descripcion),
        habilidades = COALESCE($3, habilidades),
        experiencia = COALESCE($4, experiencia),
        educacion = COALESCE($5, educacion),
        es_principal = COALESCE($6, es_principal)
      WHERE id = $7
      RETURNING *`,
      [nombre_perfil, descripcion, habilidades, experiencia, educacion, es_principal, id]
    );

    res.status(200).json({
      success: true,
      message: 'Hoja de vida actualizada exitosamente',
      data: actualizada.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar hoja de vida:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Eliminar hoja de vida
export const eliminarHojaVida = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;

    // Verificar que la hoja pertenece al estudiante
    const hoja = await client.query(
      `SELECT hv.id, hv.nombre_perfil
       FROM hojas_vida hv
       INNER JOIN estudiantes e ON hv.estudiante_id = e.cedula_id
       WHERE hv.id = $1 AND e.usuario_id = $2`,
      [id, usuarioId]
    );

    if (hoja.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hoja de vida no encontrada'
      });
    }

    // Verificar si tiene postulaciones asociadas
    const postulaciones = await client.query(
      'SELECT COUNT(*) as total FROM solicitudes WHERE hoja_vida_id = $1',
      [id]
    );

    if (Number.parseInt(postulaciones.rows[0].total) > 0) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar una hoja de vida que ha sido usada en postulaciones'
      });
    }

    await client.query('DELETE FROM hojas_vida WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: `Hoja de vida "${hoja.rows[0].nombre_perfil}" eliminada exitosamente`
    });

  } catch (error) {
    console.error('Error al eliminar hoja de vida:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Establecer hoja de vida principal
export const establecerHojaPrincipal = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.usuario.id;
    const { id } = req.params;

    // Obtener estudiante
    const estudiante = await client.query(
      'SELECT cedula_id FROM estudiantes WHERE usuario_id = $1',
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

    // Verificar que la hoja pertenece al estudiante
    const hoja = await client.query(
      'SELECT id FROM hojas_vida WHERE id = $1 AND estudiante_id = $2',
      [id, cedulaId]
    );

    if (hoja.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Hoja de vida no encontrada'
      });
    }

    // Desmarcar todas las hojas como principales
    await client.query(
      'UPDATE hojas_vida SET es_principal = FALSE WHERE estudiante_id = $1',
      [cedulaId]
    );

    // Marcar la seleccionada como principal
    await client.query(
      'UPDATE hojas_vida SET es_principal = TRUE WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Hoja de vida establecida como principal'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al establecer hoja principal:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};