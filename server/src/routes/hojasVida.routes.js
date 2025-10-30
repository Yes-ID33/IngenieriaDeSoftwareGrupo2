import { Router } from 'express';
import {
  crearHojaVida,
  listarMisHojasVida,
  obtenerHojaVida,
  actualizarHojaVida,
  eliminarHojaVida,
  establecerHojaPrincipal
} from '../controllers/hojasVida.controllers.js';
import { verificarToken } from '../middleware/autentificacion.js';
import { verificarRol } from '../middleware/verificarRol.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de estudiante
router.use(verificarToken);
router.use(verificarRol('estudiante'));

router.post('/', crearHojaVida);
router.get('/', listarMisHojasVida);
router.get('/:id', obtenerHojaVida);
router.put('/:id', actualizarHojaVida);
router.delete('/:id', eliminarHojaVida);
router.patch('/:id/establecer-principal', establecerHojaPrincipal);

export default router;