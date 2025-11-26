import { Router } from 'express';
import {
  crearVacante,
  listarMisVacantes,
  actualizarVacante,
  eliminarVacante,
  verPostulacionesVacante,
  responderPostulacion,
  listarVacantesConEmpresa
} from '../controllers/vacantes.controllers.js';
import { verificarToken } from '../middleware/autentificacion.js';
import { verificarRol } from '../middleware/verificarRol.js';

const router = Router();

// ===== RUTA PÚBLICA (sin autenticación) =====
router.get('/publicas', listarVacantesConEmpresa);

// ===== RUTAS PROTEGIDAS PARA EMPRESAS =====
// ✅ Aplicar middlewares INDIVIDUALMENTE a cada ruta
router.post('/', verificarToken, verificarRol('empresa'), crearVacante);
router.get('/mis-vacantes', verificarToken, verificarRol('empresa'), listarMisVacantes);
router.put('/:id', verificarToken, verificarRol('empresa'), actualizarVacante);
router.delete('/:id', verificarToken, verificarRol('empresa'), eliminarVacante);

// Gestión de postulaciones
router.get('/:id/postulaciones', verificarToken, verificarRol('empresa'), verPostulacionesVacante);
router.put('/postulaciones/:id/responder', verificarToken, verificarRol('empresa'), responderPostulacion);

export default router;