import { Router } from 'express';
import { 
  registrarUsuario, 
  verificarCuenta, 
  reenviarCodigoVerificacion, 
  iniciarSesion, 
  obtenerPerfil 
} from '../controllers/usuarios.controllers.js';
import { verificarToken } from '../middleware/autentificacion.js';

const router = Router();

// Ruta para registrar usuario
router.post('/registro', registrarUsuario);

// Ruta para verificar cuenta con código del email
router.post('/verificar-cuenta', verificarCuenta);

// Ruta para reenviar código de verificación
router.post('/reenviar-codigo', reenviarCodigoVerificacion);

// Ruta para iniciar sesión
router.post('/login', iniciarSesion);

// Ruta para obtener perfil
router.get('/perfil', verificarToken, obtenerPerfil);

export default router;