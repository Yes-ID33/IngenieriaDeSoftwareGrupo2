import express from 'express';
import pool from './db.js';
import cors from 'cors';
import dotenv from 'dotenv';

// IMPORTAR NUEVAS RUTAS
import estudiantesRoutes from './routes/estudiantes.routes.js';
import empresasRoutes from './routes/empresas.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import vacantesRoutes from './routes/vacantes.routes.js';

dotenv.config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// NUEVAS RUTAS ORGANIZADAS POR ROL
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vacantes', vacantesRoutes); // RUTAS DE FUNCIONALIDADES AJENAS AL ROL

// ===== RUTA TEMPORAL PARA GENERAR HASH (Eliminar) =====
import bcrypt from 'bcrypt';

app.get('/api/generar-hash/:password', async (req, res) => {
  try {
    const { password } = req.params;
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    
    res.status(200).json({
      success: true,
      password: password,
      hash: hash,
      sql: `UPDATE usuarios SET contrasena = '${hash}' WHERE correo = 'practicasprofecionalespascuali@gmail.com';`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// ============================================================

// Ruta de prueba para verificar conexión a la base de datos
app.get('/api/conexionbd', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
   
    res.status(200).json({
      success: true,
      message: 'Servidor y base de datos funcionando correctamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error de conexión a la base de datos'
    });
  }
});

// Manejo de rutas no encontradas
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`
  });
});

// Manejo graceful de cierre del servidor
process.on('SIGINT', async () => {
  console.log('Cerrando servidor...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Cerrando servidor...');
  await pool.end();
  process.exit(0);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Verifica la conexion del servidor en http://localhost:${PORT}/api/conexionbd`);
});