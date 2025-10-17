import { Router } from 'express';
import { iniciarSesion, obtenerPerfil } from '../controllers/auth.controllers.js';
import { verificarToken } from '../middleware/autentificacion.js';

const router = Router();

// Ruta para iniciar sesión (todos los roles)
router.post('/login', iniciarSesion);

// Ruta para obtener perfil del usuario autenticado
router.get('/perfil', verificarToken, obtenerPerfil);

export default router;