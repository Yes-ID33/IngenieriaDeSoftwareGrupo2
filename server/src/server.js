import express from 'express';
import pool from './db.js';
import cors from 'cors';
import dotenv from 'dotenv';
import usuariosRoutes from './routes/usuarios.routes.js';

dotenv.config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/usuarios', usuariosRoutes);

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