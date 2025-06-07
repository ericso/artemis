import { Pool } from 'pg';
import { User } from '@models/user';
import { UserService } from '@services/user.service';
import { pool } from '@config/database';

interface UserRow {
  id: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export class PostgresUserService implements UserService {
  constructor(private db: Pool = pool) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const query = 'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL';
    const result = await this.db.query<UserRow>(query, [email]);
    
    if (result.rows.length === 0) {
      return undefined;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  async create(user: User): Promise<User> {
    const query = `
      INSERT INTO users (id, email, password)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [user.id, user.email, user.password];
    const result = await this.db.query<UserRow>(query, values);

    return this.mapRowToUser(result.rows[0]);
  }

  async softDelete(email: string): Promise<void> {
    const query = `
      UPDATE users 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE email = $1 AND deleted_at IS NULL
    `;
    await this.db.query(query, [email]);
  }

  private mapRowToUser(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at
    };
  }
} 