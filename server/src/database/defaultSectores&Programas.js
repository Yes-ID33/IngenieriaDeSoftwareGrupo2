import pool from '../db.js';

export async function SectoresYProgramasDefault() {
  // Definir constantes de sectores
  const SECTOR_TECNOLOGIA = 'Tecnología y Software';
  const SECTOR_INDUSTRIAL = 'Ingeniería Industrial y Mecánica';
  const SECTOR_DISENO = 'Diseño y Creatividad';
  const SECTOR_LOGISTICA = 'Logística y Gestión';
  const SECTOR_ENERGIA = 'Energía y Electricidad';
  const SECTOR_PRODUCCION = 'Producción Industrial';
  // Definir constantes de nivel
  const NIVEL_PROF = 'Profesional';
  const NIVEL_TECNI = 'Técnico';
  const NIVEL_TECNOL = 'Tecnológico';
  // Definir constantes de facultad
  const FACU_ING = 'Ingeniería';
  const FACU_PROD = 'Producción y Diseño';

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insertar sectores
      await client.query(
        `INSERT INTO sectores (nombre, descripcion, icono) VALUES
         ($1, 'Desarrollo de software, sistemas, electrónica', '💻'),
         ($2, 'Producción, mantenimiento, mecánica', '⚙️'),
         ($3, 'Diseño gráfico, vestuario, animación', '🎨'),
         ($4, 'Logística, gestión industrial, administración', '📦'),
         ($5, 'Sistemas eléctricos, energía, electromecánica', '⚡'),
         ($6, 'Fabricación, producción, materiales', '🏭')
         ON CONFLICT (nombre) DO NOTHING`,
        [
          SECTOR_TECNOLOGIA, //$1
          SECTOR_INDUSTRIAL, //$2
          SECTOR_DISENO, //$4
          SECTOR_LOGISTICA, //$4
          SECTOR_ENERGIA, //$5
          SECTOR_PRODUCCION, //$5
        ]
      );

      // Insertar programas de Ingeniería
      await client.query(
        `INSERT INTO programas (nombre, facultad, nivel, sector_id, activo) VALUES
         ('Ingeniería de Materiales', $5, $6, (SELECT id FROM sectores WHERE nombre = $1), TRUE),
         ('Ingeniería de Software', $5, $6, (SELECT id FROM sectores WHERE nombre = $2), TRUE),
         ('Ingeniería Eléctrica', $5, $6, (SELECT id FROM sectores WHERE nombre = $3), TRUE),
         ('Ingeniería Mecánica', $5, $6, (SELECT id FROM sectores WHERE nombre = $4), TRUE),
         ('Técnica Profesional en Fabricación Digital e Impresión 3D', $5, $7, (SELECT id FROM sectores WHERE nombre = $1), TRUE),
         ('Tecnología Eléctrica', $5, $8, (SELECT id FROM sectores WHERE nombre = $3), TRUE),
         ('Tecnología en Desarrollo de Software', $5, $8, (SELECT id FROM sectores WHERE nombre = $2), TRUE),
         ('Tecnología en Electrónica Industrial', $5, $8, (SELECT id FROM sectores WHERE nombre = $2), TRUE),
         ('Tecnología en Gestión del Mantenimiento Aeronáutico', $5, $8, (SELECT id FROM sectores WHERE nombre = $4), TRUE),
         ('Tecnología en Mecánica Automotriz', $5, $8, (SELECT id FROM sectores WHERE nombre = $4), TRUE),
         ('Tecnología en Mecánica Industrial', $5, $8, (SELECT id FROM sectores WHERE nombre = $4), TRUE),
         ('Tecnología en Sistemas Electromecánicos', $5, $8, (SELECT id FROM sectores WHERE nombre = $3), TRUE),
         ('Tecnología en Sistemas Mecatrónicos', $5, $8, (SELECT id FROM sectores WHERE nombre = $2), TRUE),
         ('Tecnología en Supervisión de Sistemas de Generación y Distribución de Energía Eléctrica', $5, $8, (SELECT id FROM sectores WHERE nombre = $3), TRUE)
         ON CONFLICT (nombre) DO NOTHING`,
        [
          SECTOR_PRODUCCION, // $1
          SECTOR_TECNOLOGIA, // $2
          SECTOR_ENERGIA,    // $3
          SECTOR_INDUSTRIAL, // $4
          FACU_ING, //$5
          NIVEL_PROF, // $6
          NIVEL_TECNI, // $7
          NIVEL_TECNOL, // $8
        ]
      );

      // Insertar programas de Producción y Diseño
      await client.query(
        `INSERT INTO programas (nombre, facultad, nivel, sector_id, activo) VALUES
         ('Ingeniería Administrativa', $5, $6, (SELECT id FROM sectores WHERE nombre = $1), TRUE),
         ('Ingeniería en Logística', $5, $6, (SELECT id FROM sectores WHERE nombre = $1), TRUE),
         ('Ingeniería Industrial', $5, $6, (SELECT id FROM sectores WHERE nombre = $2), TRUE),
         ('Profesional en Diseño de Vestuario', $5, $6, (SELECT id FROM sectores WHERE nombre = $3), TRUE),
         ('Profesional en Diseño Gráfico', $5, $6, (SELECT id FROM sectores WHERE nombre = $3), TRUE),
         ('Profesional en Gestión del Diseño', $5, $6, (SELECT id FROM sectores WHERE nombre = $3), TRUE),
         ('Tecnología en Animación Digital', $5, $7, (SELECT id FROM sectores WHERE nombre = $3), TRUE),
         ('Tecnología en Diseño y Producción de Vestuario', $5, $7, (SELECT id FROM sectores WHERE nombre = $3), TRUE),
         ('Tecnología en Diseño y Producción Gráfica', $5, $7, (SELECT id FROM sectores WHERE nombre = $3), TRUE),
         ('Tecnología en Gestión Logística', $5, $7, (SELECT id FROM sectores WHERE nombre = $1), TRUE),
         ('Tecnología en Producción Industrial', $5, $7, (SELECT id FROM sectores WHERE nombre = $4), TRUE)
         ON CONFLICT (nombre) DO NOTHING`,
        [
          SECTOR_LOGISTICA,  // $1
          SECTOR_INDUSTRIAL, // $2
          SECTOR_DISENO,     // $3
          SECTOR_PRODUCCION, // $4
          FACU_PROD, //$5
          NIVEL_PROF, // $6
          NIVEL_TECNOL, // $7
        ]
      );

      await client.query('COMMIT');
      console.log('Inserción de sectores y programas completada.');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al insertar sectores/programas:', error);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error de conexión:', err);
  }
}
