import { Pool } from 'pg';
import { getSSMParameter } from './ssm';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export let pool: Pool | null = null;

interface LocalConfig {
  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
}

function loadLocalConfig(): LocalConfig {
  const configPath = resolve(__dirname, '../../config/local.env.json');
  try {
    return JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch (error) {
    console.error('Failed to load local config');
    console.error('Make sure backend/config/local.env.json exists and is properly formatted');
    throw error;
  }
}

export async function getPool(environment: string = 'local'): Promise<Pool> {
  if (pool) {
    return pool;
  }

  let config: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };

  if (environment === 'local') {
    const localConfig = loadLocalConfig();
    config = {
      host: localConfig.DB_HOST,
      port: parseInt(localConfig.DB_PORT),
      database: localConfig.DB_NAME,
      user: localConfig.DB_USER,
      password: localConfig.DB_PASSWORD
    };
  } else {
    const host = await getSSMParameter(`/autostat/${environment}/db/host`);
    const port = await getSSMParameter(`/autostat/${environment}/db/port`);
    const database = await getSSMParameter(`/autostat/${environment}/db/name`);
    const user = await getSSMParameter(`/autostat/${environment}/db/username`);
    const password = await getSSMParameter(`/autostat/${environment}/db/password`);

    config = {
      host,
      port: parseInt(port),
      database,
      user,
      password
    };
  }

  pool = new Pool({
    ...config,
    ssl: environment !== 'local' ? {
      rejectUnauthorized: false
    } : undefined
  });

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
} 