import { Router } from 'express';
import {
  listarEmpresasPendientes,
  aprobarEmpresa,
  rechazarEmpresa,
  listarTodasEmpresas
} from '../controllers/admin.controllers.js';
import { verificarToken } from '../middleware/autentificacion.js';
import { verificarRol } from '../middleware/verificarRol.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(verificarToken);
router.use(verificarRol('administrador'));

// Listar empresas pendientes de aprobación
router.get('/empresas/pendientes', listarEmpresasPendientes);

// Listar todas las empresas
router.get('/empresas', listarTodasEmpresas);

// Aprobar empresa
router.patch('/empresas/aprobar/:id', aprobarEmpresa);

// Rechazar/eliminar empresa
router.delete('/empresas/rechazar/:id', rechazarEmpresa);

export default router;