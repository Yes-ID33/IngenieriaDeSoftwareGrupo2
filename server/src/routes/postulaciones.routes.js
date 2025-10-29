import { Router } from 'express';
import {
  listarVacantesDisponibles,
  obtenerDetalleVacante,
  postularseVacante,
  listarMisPostulaciones,
  obtenerDetallePostulacion,
  cancelarPostulacion
} from '../controllers/postulaciones.controllers.js';
import { verificarToken } from '../middleware/autentificacion.js';
import { verificarRol } from '../middleware/verificarRol.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de estudiante
router.use(verificarToken);
router.use(verificarRol('estudiante'));

// Ver vacantes disponibles
router.get('/vacantes', listarVacantesDisponibles);
router.get('/vacantes/:id', obtenerDetalleVacante);

// Gestión de postulaciones
router.post('/postular', postularseVacante);
router.get('/mis-postulaciones', listarMisPostulaciones);
router.get('/mis-postulaciones/:id', obtenerDetallePostulacion);
router.delete('/mis-postulaciones/:id', cancelarPostulacion);

export default router;