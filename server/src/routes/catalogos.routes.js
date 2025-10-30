import { Router } from 'express';
import {
  obtenerSectores,
  obtenerProgramas,
  obtenerProgramasPorSector
} from '../controllers/catalogos.controllers.js';
import { verificarToken } from '../middleware/autentificacion.js';

const router = Router();

// Rutas públicas (pueden ser protegidas si quieres)
router.get('/sectores', obtenerSectores);
router.get('/programas', obtenerProgramas);
router.get('/programas/sector/:sector_id', obtenerProgramasPorSector);

export default router;