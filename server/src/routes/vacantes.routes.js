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

// Ruta pública para listar vacantes aprobadas
router.get('/publicas', listarVacantesConEmpresa);

// ===== RUTAS PROTEGIDAS PARA EMPRESAS =====
// Middleware de autenticación y rol para las siguientes rutas
router.use(verificarToken);
router.use(verificarRol('empresa'));

// CRUD de vacantes
router.post('/', crearVacante);
router.get('/mis-vacantes', listarMisVacantes);
router.put('/:id', actualizarVacante);
router.delete('/:id', eliminarVacante);

// Gestión de postulaciones
router.get('/:id/postulaciones', verPostulacionesVacante);
router.patch('/postulaciones/:id/responder', responderPostulacion);

export default router;