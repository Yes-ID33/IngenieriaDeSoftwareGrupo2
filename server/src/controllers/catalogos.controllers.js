import pool from '../db.js';

// Obtener todos los sectores
export const obtenerSectores = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const sectores = await client.query(
      'SELECT * FROM sectores WHERE activo = TRUE ORDER BY nombre'
    );

    res.status(200).json({
      success: true,
      data: {
        sectores: sectores.rows
      }
    });
  } catch (error) {
    console.error('Error al obtener sectores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Obtener todos los programas
export const obtenerProgramas = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const programas = await client.query(`
      SELECT 
        p.*,
        s.nombre as sector_nombre,
        s.icono as sector_icono
      FROM programas p
      LEFT JOIN sectores s ON p.sector_id = s.id
      WHERE p.activo = TRUE
      ORDER BY p.facultad, p.nivel DESC, p.nombre
    `);

    res.status(200).json({
      success: true,
      data: {
        total: programas.rows.length,
        programas: programas.rows
      }
    });
  } catch (error) {
    console.error('Error al obtener programas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};

// Obtener programas por sector
export const obtenerProgramasPorSector = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { sector_id } = req.params;

    const programas = await client.query(`
      SELECT * FROM programas 
      WHERE sector_id = $1 AND activo = TRUE
      ORDER BY nivel DESC, nombre
    `, [sector_id]);

    res.status(200).json({
      success: true,
      data: {
        programas: programas.rows
      }
    });
  } catch (error) {
    console.error('Error al obtener programas por sector:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    client.release();
  }
};