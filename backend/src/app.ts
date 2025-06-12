import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import authRoutes from '@routes/auth.routes';
import carRoutes from '@routes/car.routes';
import fillupRoutes from '@routes/fillup.routes';
import { verifyToken, AuthRequest } from '@middleware/auth.middleware';
import { env } from '@config/env';

const app: Express = express();

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Log the incoming origin for debugging
    console.log('Express CORS - Incoming Origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Express CORS - No origin provided');
      return callback(null, true);
    }
    
    if (env.CORS_ALLOWED_ORIGINS.includes(origin)) {
      console.log('Express CORS - Origin allowed:', origin);
      callback(null, origin);
    } else {
      console.log('Express CORS - Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Amz-Date',
    'X-Api-Key',
    'X-Amz-Security-Token',
    'X-Amz-User-Agent'
  ],
  exposedHeaders: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Middleware for parsing JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV
  });
});

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
  console.error('Error:', err);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

export default app; 