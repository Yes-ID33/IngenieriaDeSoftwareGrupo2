import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const autorizacion = req.headers.authorization;
    
    if (!autorizacion) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // El formato esperado es: "Bearer <token>"
    const token = autorizacion.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar información del usuario al objeto req
    req.usuario = decoded;
    
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Error en verificarToken:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};