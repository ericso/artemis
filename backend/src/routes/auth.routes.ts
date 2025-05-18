import { Router, Request, Response, RequestHandler } from 'express';
import { AuthController } from '@controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/register', ((req: Request, res: Response) => {
  void authController.register(req, res);
}) as RequestHandler);

router.post('/login', ((req: Request, res: Response) => {
  void authController.login(req, res);
}) as RequestHandler);

export default router; 