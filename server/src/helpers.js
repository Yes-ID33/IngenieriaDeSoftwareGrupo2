import pool from "./db";
//este archivo se puede usar para tener consultas frecuentes y no repetir tanto código, 
// especialmente en los controladores

export async function getEstudianteID(usuarioId) {
    const result = await pool.query(
        'SELECT cedula_id FROM estudiantes WHERE usuario_id = $1',
        [usuarioId]
    );

    if (result.rows.length === 0){
        throw new Error('Estudiante no encontrado');
    }

    return result.rows[0].cedula_id;
}