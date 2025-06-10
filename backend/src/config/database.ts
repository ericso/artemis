import { Pool } from 'pg';
import { env } from './env';

// Configure connection pool optimized for Lambda
const pool = new Pool({
  user: env.DB.USER,
  host: env.DB.HOST,
  database: env.DB.NAME,
  password: env.DB.PASSWORD,
  port: env.DB.PORT,
  // Lambda-optimized pool configuration
  max: 1, // Reuse connections in the Lambda container
  idleTimeoutMillis: 120000, // Matches Lambda timeout
  connectionTimeoutMillis: 10000,
  // Only enable SSL in production environment
  ...(env.NODE_ENV === 'production' && {
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