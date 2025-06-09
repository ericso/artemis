import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
  user: env.DB.USER,
  host: env.DB.HOST,
  database: env.DB.NAME,
  password: env.DB.PASSWORD,
  port: env.DB.PORT,
}); 