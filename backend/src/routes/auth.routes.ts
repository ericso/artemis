import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// Register endpoint
router.post('/register', authController.register);

// Login endpoint
router.post('/login', authController.login);

export default router; 