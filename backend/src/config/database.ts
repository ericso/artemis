import { Pool } from 'pg';
import { env } from './env';

// Configure connection pool
const pool = new Pool({
  user: env.DB.USER,
  host: env.DB.HOST,
  database: env.DB.NAME,
  password: env.DB.PASSWORD,
  port: env.DB.PORT,
  
  // Environment-specific configuration
  ...(env.NODE_ENV === 'local' ? {
    // Local development configuration
    max: 10, // Allow more concurrent connections
    idleTimeoutMillis: 30000, // 30 seconds
    connectionTimeoutMillis: 5000, // 5 seconds
  } : {
    // Lambda/Production configuration for all non-local environments
    max: 1, // Reuse connections in the Lambda container
    idleTimeoutMillis: 120000, // Matches Lambda timeout
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false // Required for Aurora Serverless v2
    }
  })
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export { pool }; 