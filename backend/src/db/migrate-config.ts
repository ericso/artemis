import { Pool, PoolConfig } from 'pg';
import { resolve } from 'path';
import { readFileSync } from 'fs';

type Environment = 'local' | 'dev';

interface MigrationConfig {
  pool: Pool;
  environment: Environment;
}

interface EnvConfig {
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_PORT: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
}

function loadConfig(environment: Environment): EnvConfig {
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

function getPoolConfig(environment: Environment): PoolConfig {
  const config = loadConfig(environment);

  // Base configuration
  const poolConfig: PoolConfig = {
    user: config.DB_USER,
    host: config.DB_HOST,
    database: config.DB_NAME,
    password: config.DB_PASSWORD,
    port: parseInt(config.DB_PORT || '5432'),
  };

  // Environment-specific configurations
  switch (environment) {
    case 'local':
      return {
        ...poolConfig,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      };
    case 'dev':
      return {
        ...poolConfig,
        max: 1,
        idleTimeoutMillis: 120000,
        connectionTimeoutMillis: 10000,
        ssl: {
          rejectUnauthorized: false // Required for Aurora Serverless v2
        }
      };
  }
}

export function getMigrationConfig(environment: Environment): MigrationConfig {
  const poolConfig = getPoolConfig(environment);
  const pool = new Pool(poolConfig);

  // Handle pool errors
  pool.on('error', (err) => {
    console.error(`Unexpected error on idle client (${environment})`, err);
    process.exit(-1);
  });

  return {
    pool,
    environment,
  };
} 