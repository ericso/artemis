import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import authRoutes from '@routes/auth.routes';
import carRoutes from '@routes/car.routes';
import fillupRoutes from '@routes/fillup.routes';
import { verifyToken, AuthRequest } from '@middleware/auth.middleware';
import { env } from '@config/env';

const app: Express = express();

// Basic CORS configuration
app.use(cors({
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware for parsing JSON bodies
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/cars', carRoutes);
app.use('/fillups', fillupRoutes);

// Protected route example
app.get('/protected', [verifyToken as RequestHandler], ((req: AuthRequest, res: Response): void => {
  res.status(200).json({ 
    message: "Protected route accessed successfully",
    user: (req as AuthRequest).user
  });
}) as RequestHandler);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Express + TypeScript Server' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app; 