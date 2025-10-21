import { Router } from 'express';
import { registrarEmpresa } from '../controllers/empresas.controllers.js';

const router = Router();

// Ruta para registrar empresa
router.post('/registro', registrarEmpresa);

export default router;