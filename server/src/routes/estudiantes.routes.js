import { Router } from 'express';
import {
  registrarEstudiante,
  verificarCuentaEstudiante,
  reenviarCodigoEstudiante
} from '../controllers/estudiantes.controllers.js';

const router = Router();

// Ruta para registrar estudiante
router.post('/registro', registrarEstudiante);

// Ruta para verificar cuenta de estudiante con código del email
router.post('/verificar-cuenta', verificarCuentaEstudiante);

// Ruta para reenviar código de verificación
router.post('/reenviar-codigo', reenviarCodigoEstudiante);

export default router;