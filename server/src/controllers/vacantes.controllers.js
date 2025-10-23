import pool from '../db.js';

export const listarVacantesConEmpresa = async (req, res) => {
  const client = await pool.connect();
  try {//esta consulta con inner join es para obtener campos de la empresa y de la vacante para mostrarla, falta comprobar
    const resultado = await client.query(` 
      SELECT 
        v.vacante_id,
        v.sector,
        v.modalidad,
        v.salario,
        v.requisitos,
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
