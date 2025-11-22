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
import hojasVidaRoutes from './routes/hojasVida.routes.js';
import postulacionesRoutes from './routes/postulaciones.routes.js';
import catalogosRoutes from './routes/catalogos.routes.js';

dotenv.config();
//importante importar después de cargar el dotenv
import { insertarDefault } from './database/defaultUsers.js';
//función para insertar programas y sectores sin repetir muchas líneas
import { SectoresYProgramasDefault } from './database/defaultSectores&Programas.js';


// función para probar la conexión x veces con un intervalo de z tiempo entre cada intento
async function waitForDb(retries = 10, delay = 15000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ DB lista');
      return true;
    } catch (err) {
      console.log(`DB no lista, reintento ${i + 1}/${retries} en ${delay / 1000}s`);
      console.log(`El error es: `, err);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('No se pudo conectar a la DB después de varios intentos');
}

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
app.use('/api/vacantes', vacantesRoutes); // Rutas para empresas Y públicas
app.use('/api/estudiantes/hojas-vida', hojasVidaRoutes);
app.use('/api/estudiantes/postulaciones', postulacionesRoutes);
app.use('/api/catalogos', catalogosRoutes);


// ===== RUTA TEMPORAL PARA GENERAR HASH (Eliminar) =====
import bcrypt from 'bcrypt';

app.get('/api/generar-hash/:texto', async (req, res) => {
  try {
    const { texto } = req.params;
    const saltRounds = 12;
    const hash = await bcrypt.hash(texto, saltRounds);
    
    res.status(200).json({
      hash: hash
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


  try {
    await waitForDb();          // espera hasta que la DB esté lista
    await insertarDefault();    // inserta usuarios por defecto
    await SectoresYProgramasDefault();    // inserta sectores y programas por defecto

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Verifica la conexion del servidor en http://localhost:${PORT}/api/conexionbd`);
    });
  } catch (err) {
    console.error('❌ Error al inicializar la aplicación: ', err);
    process.exit(1);
  }
