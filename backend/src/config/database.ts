import { Pool } from 'pg';
import { env } from './env';

// Configure connection pool
const pool = new Pool({
  user: env.DB.USER,
  host: env.DB.HOST,
  database: env.DB.NAME,
  password: env.DB.PASSWORD,
  port: env.DB.PORT,
  
  // Development vs Production configuration
  ...(env.NODE_ENV === 'production' ? {
    // Lambda-optimized pool configuration for production
    max: 1, // Reuse connections in the Lambda container
    idleTimeoutMillis: 120000, // Matches Lambda timeout
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false // Required for Aurora Serverless v2
    }
  } : {
    // Development-optimized pool configuration
    max: 10, // Allow more concurrent connections
    idleTimeoutMillis: 30000, // 30 seconds
    connectionTimeoutMillis: 5000, // 5 seconds
  })
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  if (env.NODE_ENV === 'production') {
    process.exit(-1);
  }
});

export { pool }; 