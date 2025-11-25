import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// Inicialización del cliente S3 con credenciales y región desde variables de entorno
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Sube un PDF a S3 con nomenclatura: hojas-vida/<apellido>-<nombre>-<timestamp>-<originalName>.pdf
 * 
 * @param {Buffer} fileBuffer - El contenido del archivo PDF
 * @param {string} originalName - Nombre original del archivo (ej. hoja_de_vida.pdf)
 * @param {string} nombre - Nombre del estudiante
 * @param {string} apellido - Apellido del estudiante
 * @returns {Promise<string>} URL pública del archivo en S3
 */
export async function subirPdfHojasDeVida(fileBuffer, originalName, nombre, apellido) {
  // Validaciones básicas
  if (!fileBuffer) {
    throw new Error("El archivo está vacío o no fue recibido.");
  }
  if (typeof originalName !== "string" || !originalName.toLowerCase().endsWith(".pdf")) {
    throw new Error("Solo se permiten archivos PDF.");
  }

  // Normalización de nombre y apellido para evitar espacios y mayúsculas
  const timestamp = Date.now();
  const safeNombre = nombre.replace(/\s+/g, "-").toLowerCase();
  const safeApellido = apellido.replace(/\s+/g, "-").toLowerCase();
  const safeOriginal = originalName.replace(/\s+/g, "-").toLowerCase();

  // Clave única para el objeto en S3
  const key = `hojas-vida/${safeApellido}-${safeNombre}-${timestamp}-${safeOriginal}`;

  // Comando de subida a S3
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: "application/pdf",
    ACL: "public-read" // El archivo será accesible públicamente solo para lectura
  });

  // Enviar el archivo a S3 (operación asíncrona)
  await s3.send(command);

  // Retornar la URL pública del archivo subido
  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
