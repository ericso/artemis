import { Pool, PoolConfig } from 'pg';
import { env, getConfig } from './env';
import * as net from 'net';

// Initialize pool
let pool: Pool | null = null;

async function testTcpConnection(host: string, port: number): Promise<void> {
  console.log(`Testing TCP connection to ${host}:${port}...`);
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    
    socket.setTimeout(5000); // 5 seconds timeout
    
    socket.on('connect', () => {
      console.log('TCP connection successful');
      socket.destroy();
      resolve();
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error(`Cannot establish TCP connection to ${host}:${port}. Please check if:\n1. The host and port are correct\n2. The database is running\n3. Any firewalls or security groups allow the connection\n4. You have network connectivity to the host`));
    });
    
    socket.on('error', (error) => {
      socket.destroy();
      reject(error);
    });
    
    socket.connect(port, host);
  });
}

async function getPool(environment: string = 'local'): Promise<Pool> {
  if (pool) {
    return pool;
  }
  
  console.log(`Loading config for environment: ${environment}`);
  await getConfig(environment);
  
  console.log('Using environment variables for configuration');
  
  const poolConfig: PoolConfig = {
    user: env.DB.USER,
    host: env.DB.HOST,
    database: env.DB.NAME,
    password: env.DB.PASSWORD,
    port: env.DB.PORT,
    max: 1, // Use a single connection for migrations
    idleTimeoutMillis: 300000, // 5 minutes
    connectionTimeoutMillis: 60000, // 60 seconds
    ssl: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  };
  
  console.log('Database connection config:', {
    ...poolConfig,
    password: '******'
  });
  
  // Test TCP connectivity first
  const host = poolConfig.host;
  const port = poolConfig.port;
  if (!host || !port) {
    throw new Error('Database host and port must be defined');
  }
  await testTcpConnection(host, port);
  
  console.log('Attempting to connect to database...');
  pool = new Pool(poolConfig);
  
  // Add event handlers for debugging
  pool.on('connect', () => {
    console.log('New client connected to the database');
  });
  
  pool.on('acquire', () => {
    console.log('Client acquired from pool');
  });
  
  pool.on('remove', () => {
    console.log('Client removed from pool');
  });
  
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client:', err);
  });
  
  // Test the connection
  console.log('Testing database connection...');
  try {
    const client = await pool.connect();
    console.log('Client connected successfully');
    const result = await client.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0].now);
    client.release();
    return pool;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    await closePool();
    throw error;
  }
}

// Export a function to close the pool
async function closePool(): Promise<void> {
  if (pool) {
    console.log('Closing database connection pool...');
    await pool.end();
    pool = null;
    console.log('Database connection pool closed');
  }
}

export { getPool, closePool }; 