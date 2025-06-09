import { env } from './env';

// Validate JWT secret is set
if (!env.JWT.SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const JWT_SECRET = env.JWT.SECRET;
export const JWT_EXPIRES_IN = env.JWT.EXPIRES_IN; 