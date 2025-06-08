import { Router, RequestHandler } from 'express';
import { FillupController } from '@controllers/fillup.controller';
import { verifyToken } from '@middleware/auth.middleware';

const router = Router();
const fillupController = new FillupController();

// Get fillups (optionally filtered by carId)
router.get('/', verifyToken as RequestHandler, fillupController.getFillups);

// Create a new fillup
router.post('/', verifyToken as RequestHandler, fillupController.createFillup);

// Update a fillup
router.put('/:id', verifyToken as RequestHandler, fillupController.updateFillup);

// Delete a fillup
router.delete('/:id', verifyToken as RequestHandler, fillupController.deleteFillup);

export default router; 