import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  JWT: {
    SECRET: process.env.JWT_SECRET,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
  },
  DB: {
    USER: process.env.DB_USER,
    HOST: process.env.DB_HOST,
    NAME: process.env.DB_NAME,
    PASSWORD: process.env.DB_PASSWORD,
    PORT: parseInt(process.env.DB_PORT || '5432', 10),
  }
} as const; 