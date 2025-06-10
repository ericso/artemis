import app from './app';
import { env } from './config/env';
import { pool } from '@config/database';

const port = env.PORT;

// Store server instance so we can close it later
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} (${env.NODE_ENV})`);
});

// Graceful shutdown handler
const shutdown = async () => {
  console.log('\nShutdown signal received...');

  // Close Express server first (stop accepting new connections)
  server.close(() => {
    console.log('Express server closed');
  });

  try {
    // Close database pool
    await pool.end();
    console.log('Database pool closed');
    
    // Exit process
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
}); 