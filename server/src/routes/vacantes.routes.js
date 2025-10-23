import { Router } from 'express';
import { listarVacantesConEmpresa } from '../controllers/vacantes.controllers.js';

const router = Router();

// Ruta pública para listar vacantes aprobadas con datos de empresa
//toca arreglarla, mirar solicitud.jsx, vacantes.jsx, crearVacante.jsx y VacanteTarjeta.jsx
router.get('/', listarVacantesConEmpresa);

export default router;
