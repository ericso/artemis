import { Pool } from 'pg';
import { User } from '@models/user';
import { UserService } from '@services/user.service';
import { pool } from '@config/database';

export class PostgresUserService implements UserService {
  constructor(private db: Pool = pool) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const query = 'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL';
    const result = await this.db.query(query, [email]);
    
    if (result.rows.length === 0) {
      return undefined;
    }

    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      password: result.rows[0].password,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
      deleted_at: result.rows[0].deleted_at
    };
  }

  async create(user: User): Promise<User> {
    const query = `
      INSERT INTO users (id, email, password)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [user.id, user.email, user.password];
    const result = await this.db.query(query, values);

    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      password: result.rows[0].password,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
      deleted_at: result.rows[0].deleted_at
    };
  }

  async softDelete(email: string): Promise<void> {
    const query = `
      UPDATE users 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE email = $1 AND deleted_at IS NULL
    `;
    await this.db.query(query, [email]);
  }
} 