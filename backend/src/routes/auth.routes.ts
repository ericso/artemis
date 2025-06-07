import { Router, Request, Response } from 'express';
import { AuthController } from '@controllers/auth.controller';
import { AuthRequestBody, AuthResponse } from '@controllers/auth.controller';

const router = Router();
const authController = new AuthController();

type AuthHandler = Request<Record<string, never>, AuthResponse, AuthRequestBody>;

router.post('/register', async (req: AuthHandler, res: Response) => {
  await authController.register(req, res);
});

router.post('/login', async (req: AuthHandler, res: Response) => {
  await authController.login(req, res);
});

export default router; 