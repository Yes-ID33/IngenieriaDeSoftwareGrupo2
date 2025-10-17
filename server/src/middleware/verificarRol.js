// Middleware para verificar roles de usuario
export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    try {
      // El usuario ya debe estar en req.usuario gracias a verificarToken
      if (!req.usuario) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado'
        });
      }

      // Verificar si el rol del usuario está en los roles permitidos
      if (!rolesPermitidos.includes(req.usuario.rol)) {
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Error en verificarRol:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};