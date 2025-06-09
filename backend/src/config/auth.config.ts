import { env } from './env';

// Validate JWT secret is set
if (!env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const JWT_SECRET = env.JWT_SECRET;
export const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN || '24h'; 