import { spawnSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const bucket = process.env.S3_BUCKET;
const region = process.env.AWS_REGION;
const dbName = process.env.DB_DATABASE;
const dbUser = process.env.DB_USER;

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const fileTimestamp = `./backups/backup_${timestamp}.sql`;
const fileLatest = `./backups/ultimoBackup.sql`;

try {
  console.log('💾 Generando backup...');
  // Ejecutar pg_dump y guardar directamente en archivo .sql
  const pgDump = spawnSync('pg_dump', ['-U', dbUser, dbName], { encoding: 'utf-8' });
  if (pgDump.error) throw pgDump.error;
  fs.writeFileSync(fileTimestamp, pgDump.stdout);

  console.log('📤 Subiendo backup con timestamp...');
  spawnSync('aws', ['s3', 'cp', fileTimestamp, `s3://${bucket}/backups/`, '--region', region], { stdio: 'inherit' });

  console.log('📤 Subiendo backup como ultimoBackup...');
  fs.copyFileSync(fileTimestamp, fileLatest);
  spawnSync('aws', ['s3', 'cp', fileLatest, `s3://${bucket}/ultimoBackup.sql`, '--region', region], { stdio: 'inherit' });

  console.log('✅ Backup completado');
} catch (err) {
  console.error('❌ Error en backup:', err.message);
}
