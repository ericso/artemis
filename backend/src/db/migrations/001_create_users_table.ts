import { Pool } from 'pg';
import { pool } from '@config/database';

export async function up(db: Pool = pool): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email VARCHAR UNIQUE NOT NULL,
      password VARCHAR NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
    )
  `);
}

export async function down(db: Pool = pool): Promise<void> {
  await db.query('DROP TABLE IF EXISTS users CASCADE');
} 