import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import authRoutes from '@routes/auth.routes';
import { verifyToken, AuthRequest } from '@middleware/auth.middleware';

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vue.js dev server default port
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Routes
app.use('/auth', authRoutes);

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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app; 