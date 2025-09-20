import nodemailer from 'nodemailer';

// Configurar transportador
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verificar configuración del transportador
export const verificarConfiguracionEmail = async () => {
  try {
    await transporter.verify();
    console.log('✅ Configuración de email verificada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en configuración de email:', error.message);
    return false;
  }
};

// Generar token de verificación (6 dígitos)
export const generarTokenVerificacion = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Enviar email de verificación
export const enviarEmailVerificacion = async (correo, nombre, token) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: correo,
      subject: '📧 Código de Verificación - Prácticas Profesionales Pascualinas',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2E8B57; margin: 0;">Prácticas Profesionales Pascualinas</h1>
            <p style="color: #666; margin: 5px 0;">Sistema de Gestión de Prácticas</p>
          </div>
          
          <h2 style="color: #333;">¡Hola ${nombre}!</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Gracias por registrarte en nuestro sistema. Para completar tu registro y activar tu cuenta, 
            necesitas verificar tu dirección de correo electrónico.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">
              <strong>Tu código de verificación es:</strong>
            </p>
            <div style="background-color: #2E8B57; color: white; padding: 15px 25px; border-radius: 5px; display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
              ${token}
            </div>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              ⏰ <strong>Importante:</strong> Este código expira en <strong>15 minutos</strong>
            </p>
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            Ingresa este código en el sistema para activar tu cuenta y poder iniciar sesión.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <div style="color: #888; font-size: 12px; text-align: center;">
            <p>Si no solicitaste esta verificación, puedes ignorar este correo.</p>
            <p><strong>Institución Universitaria Pascual Bravo</strong></p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de verificación enviado a: ${correo}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw new Error('No se pudo enviar el email de verificación');
  }
};

// Enviar email de bienvenida después de verificar cuenta
export const enviarEmailBienvenida = async (correo, nombre) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: correo,
      subject: '🎉 ¡Cuenta Activada! - Prácticas Profesionales Pascualinas',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2E8B57; margin: 0;">¡Bienvenido ${nombre}!</h1>
          </div>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h2 style="color: #155724; margin: 0 0 10px 0;">✅ ¡Tu cuenta ha sido verificada exitosamente!</h2>
            <p style="color: #155724; margin: 0;">Ya puedes iniciar sesión y comenzar a explorar oportunidades de prácticas profesionales.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #333; font-size: 16px;">¿Listo para encontrar tu práctica profesional ideal?</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
               style="background-color: #2E8B57; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              🚀 Iniciar Sesión
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <div style="color: #888; font-size: 12px; text-align: center;">
            <p><strong>Institución Universitaria Pascual Bravo</strong></p>
            <p>Sistema de Gestión de Prácticas Profesionales</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de bienvenida enviado a: ${correo}`);
    
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error);
  }
};  