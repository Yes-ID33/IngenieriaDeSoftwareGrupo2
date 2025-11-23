import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const bucket = process.env.S3_BUCKET;
const region = process.env.AWS_REGION;
const dbName = process.env.DB_DATABASE;
const dbUser = process.env.DB_USER;

// Generar timestamp limpio para el nombre del archivo
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Rutas locales dentro de ./backups
const fileTimestamp = `./backups/backup_${timestamp}.sql.gz`;
const fileLatest = `./backups/ultimoBackup.sql.gz`;

try {
  console.log('💾 Generando backup...');
  execSync(`pg_dump -U ${dbUser} ${dbName} | gzip > ${fileTimestamp}`, { stdio: 'inherit' });

  console.log('📤 Subiendo backup con timestamp...');
  execSync(`aws s3 cp ${fileTimestamp} s3://${bucket}/backups/ --region ${region}`, { stdio: 'inherit' });

  console.log('📤 Subiendo backup como ultimoBackup...');
  execSync(`cp ${fileTimestamp} ${fileLatest}`);
  execSync(`aws s3 cp ${fileLatest} s3://${bucket}/ultimoBackup.sql.gz --region ${region}`, { stdio: 'inherit' });

  console.log('✅ Backup completado');
} catch (err) {
  console.error('❌ Error en backup:', err.message);
}
