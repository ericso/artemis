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
}

function loadConfig(): EnvConfig {
  const environment = process.env.NODE_ENV === 'test' ? 'test' : 
                     process.env.NODE_ENV === 'development' ? 'dev' : 'local';
  
  const configPath = resolve(__dirname, `../../config/${environment}.env.json`);
  try {
    return JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch (error) {
    console.error(`Failed to load config for ${environment} environment`);
    console.error(`Make sure ${configPath} exists and is properly formatted`);
    console.error(`You can copy ${environment}.example.json to ${environment}.env.json and update the values`);
    throw error;
  }
}

const config = loadConfig();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'local',
  PORT: parseInt(process.env.PORT || '3000', 10),
  FRONTEND_URL: config.FRONTEND_URL,
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