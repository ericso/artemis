import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@models/user';
import { JWT_SECRET } from '@config/auth.config';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
} 