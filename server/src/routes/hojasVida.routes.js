import { Router } from 'express';
import multer from 'multer';
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

// configurar multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 8000000 //8MB
  }
});

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