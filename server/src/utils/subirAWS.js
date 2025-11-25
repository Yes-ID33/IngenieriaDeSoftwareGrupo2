import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

/**
 * Sube un PDF a S3 con nomenclatura: hojas-vida/<apellido>-<nombre>-<timestamp>.pdf
 * @param {Buffer} fileBuffer - El contenido del archivo PDF
 * @param {string} originalName - Nombre original del archivo
 * @param {string} nombre - Nombre del estudiante
 * @param {string} apellido - Apellido del estudiante
 * @returns {string} URL pública del archivo en S3
 */

export async function subirPdfHojasDeVida( fileBuffer, originalName, nombre, apellido ){
    const timestamp = Date.now();
    const safeNombre = nombre.replace(/\s+/g, "-").toLowerCase();
    const safeApellido = apellido.replace(/\s+/g, "-").toLowerCase();
    const key = `hojas-vida/${safeApellido}-${safeNombre}-${timestamp}.pdf`;

    const command = new PutObjectCommand({
        Bucket : process.env.S3_BUCKET,
        Key : key,
        Body : fileBuffer,
        ContentType : "application/pdf",
        ACL : "public-read" //con esto cualquiera accede al objeto, pero no pueden cambiarlo ni borrarlo
    });

    await s3.send(command);

    return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

}