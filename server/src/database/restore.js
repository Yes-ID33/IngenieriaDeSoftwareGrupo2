import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const bucket = process.env.S3_BUCKET;
const region = process.env.AWS_REGION;
const dbName = process.env.DB_DATABASE;
const dbUser = process.env.DB_USER;

const localFileGz = './backups/ultimoBackup.sql.gz';
const localFileSql = './backups/ultimoBackup.sql';

try {
  console.log('📥 Descargando último backup desde S3...');
  execSync(`aws s3 cp s3://${bucket}/ultimoBackup.sql.gz ${localFileGz} --region ${region}`, { stdio: 'inherit' });

  console.log('📂 Descomprimiendo...');
  execSync(`gunzip -c ${localFileGz} > ${localFileSql}`, { stdio: 'inherit' });

  console.log('🔄 Restaurando en la base de datos...');
  execSync(`psql -U ${dbUser} -d ${dbName} -f ${localFileSql}`, { stdio: 'inherit' });

  console.log('✅ Restore completado');
} catch (err) {
  console.error('❌ Error en restore:', err.message);
}
