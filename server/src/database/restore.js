import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';

dotenv.config();

const bucket = process.env.S3_BUCKET;
const region = process.env.AWS_REGION;
const dbName = process.env.DB_DATABASE;
const dbUser = process.env.DB_USER;
// Rutas absolutas seguras
const PSQL = '/usr/bin/psql';
const AWS = '/usr/bin/aws';

const localFileSql = './backups/ultimoBackup.sql';

try {
  console.log('📥 Descargando último backup desde S3...');
  spawnSync(AWS, ['s3', 'cp', `s3://${bucket}/ultimoBackup.sql`, localFileSql, '--region', region], { stdio: 'inherit' });

  console.log('🔄 Restaurando en la base de datos...');
  spawnSync(PSQL, ['-U', dbUser, '-d', dbName, '-f', localFileSql], { stdio: 'inherit' });

  console.log('✅ Restore completado');
} catch (err) {
  console.error('❌ Error en restore:', err.message);
}