import { resolve } from 'path';
import { readFileSync } from 'fs';

interface EnvConfig {
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_PORT: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  CORS_ALLOWED_ORIGINS: string;
}

function loadConfig(): EnvConfig {
  // Only load from file in local environment
  if (process.env.NODE_ENV === 'local') {
    const configPath = resolve(__dirname, '../../config/local.env.json');
    try {
      return JSON.parse(readFileSync(configPath, 'utf-8'));
    } catch (error) {
      console.error('Failed to load config for local environment');
      console.error(`Make sure ${configPath} exists and is properly formatted`);
      console.error('You can copy local.example.json to local.env.json and update the values');
      throw error;
    }
  }

  // For non-local environments, use environment variables
  return {
    DB_HOST: process.env.DB_HOST || '',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || '',
    DB_PORT: process.env.DB_PORT || '5432',
    JWT_SECRET: process.env.JWT_SECRET || '',
    FRONTEND_URL: process.env.FRONTEND_URL || '',
    CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS || ''
  };
}

const config = loadConfig();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET', 'FRONTEND_URL', 'CORS_ALLOWED_ORIGINS'];
for (const envVar of requiredEnvVars) {
  if (!config[envVar as keyof EnvConfig]) {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'local',
  PORT: parseInt(process.env.PORT || '3000', 10),
  FRONTEND_URL: config.FRONTEND_URL,
  CORS_ALLOWED_ORIGINS: config.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),
  JWT: {
    SECRET: config.JWT_SECRET,
    EXPIRES_IN: '24h'
  },
  DB: {
    USER: config.DB_USER,
    HOST: config.DB_HOST,
    NAME: config.DB_NAME,
    PASSWORD: config.DB_PASSWORD,
    PORT: parseInt(config.DB_PORT || '5432', 10),
  }
} as const;