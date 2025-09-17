require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la BD
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(config).connect();

// Ruta de prueba
app.get('/api', async (req, res, next) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT GETDATE() AS now');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`Servidor en http://localhost:${process.env.PORT || 5000}`)
);
