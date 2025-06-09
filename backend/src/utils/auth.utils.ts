import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '@config/auth.config';
import { User } from '@models/user';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

interface JWTPayload {
  id: string | undefined;
  email: string | undefined;
}

export const generateToken = (user: Partial<User>): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  const payload: JWTPayload = { id: user.id, email: user.email };
  const secret: Secret = JWT_SECRET;
  
  return jwt.sign(payload, secret);
}; 