import { Router } from 'express';
import {
  listarEmpresasPendientes,
  aprobarEmpresa,
  rechazarEmpresa,
  listarTodasEmpresas,
  listarTodosUsuarios,
  eliminarUsuario
} from '../controllers/admin.controllers.js';
import { verificarToken } from '../middleware/autentificacion.js';
import { verificarRol } from '../middleware/verificarRol.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(verificarToken);
router.use(verificarRol('administrador'));

// ========== GESTIÓN DE EMPRESAS ==========
// Listar empresas pendientes de aprobación
router.get('/empresas/pendientes', listarEmpresasPendientes);

// Listar todas las empresas
router.get('/empresas', listarTodasEmpresas);

// Aprobar empresa
router.patch('/empresas/aprobar/:id', aprobarEmpresa);

// Rechazar/eliminar empresa
router.delete('/empresas/rechazar/:id', rechazarEmpresa);

// ========== GESTIÓN DE USUARIOS ==========
// Listar todos los usuarios
router.get('/usuarios', listarTodosUsuarios);

// Eliminar usuario
router.delete('/usuarios/:id', eliminarUsuario);

export default router;