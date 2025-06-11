import { Pool } from 'pg';
import { env, getConfig } from './env';

// Initialize pool
let pool: Pool | null = null;

export async function getPool(environment?: string): Promise<Pool> {
  if (pool) {
    return pool;
  }

  // Ensure config is loaded
  await getConfig(environment);
  
  const config = {
    user: env.DB.USER,
    host: env.DB.HOST,
    database: env.DB.NAME,
    password: env.DB.PASSWORD,
    port: env.DB.PORT,
  };

  if (env.NODE_ENV === 'local') {
    // Local development configuration
    Object.assign(config, {
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  } else if (env.NODE_ENV === 'dev') {
    // Dev environment configuration
    Object.assign(config, {
      max: 1,
      idleTimeoutMillis: 120000,
      connectionTimeoutMillis: 10000,
      ssl: false
    });
  } else {
    // Production configuration
    Object.assign(config, {
      max: 1,
      idleTimeoutMillis: 120000,
      connectionTimeoutMillis: 10000,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  
  // Log connection details (excluding password)
  console.log('Attempting database connection with:', {
    ...config,
    password: '******',
  });
  
  pool = new Pool(config);

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  return pool;
}

// Export a function to close the pool
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
} 