import { Pool } from 'pg';
import { Car } from '@models/car';
import { CarService } from '@services/car.service';
import { pool } from '@config/database';

interface CarRow {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  name: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export class PostgresCarService implements CarService {
  constructor(private db: Pool = pool) {}

  async findById(id: string): Promise<Car | undefined> {
    const query = 'SELECT * FROM cars WHERE id = $1 AND deleted_at IS NULL';
    const result = await this.db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return undefined;
    }

    return this.mapRowToCar(result.rows[0]);
  }

  async findByUserId(userId: string): Promise<Car[]> {
    const query = 'SELECT * FROM cars WHERE user_id = $1 AND deleted_at IS NULL';
    const result = await this.db.query(query, [userId]);
    
    return result.rows.map(this.mapRowToCar);
  }

  async create(car: Car): Promise<Car> {
    const query = `
      INSERT INTO cars (id, make, model, year, vin, name, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [car.id, car.make, car.model, car.year, car.vin, car.name, car.user_id];
    const result = await this.db.query(query, values);

    return this.mapRowToCar(result.rows[0]);
  }

  async update(id: string, car: Partial<Car>): Promise<Car | undefined> {
    // Build the update query dynamically based on the provided fields
    const updates: string[] = [];
    const values: (string | number | null)[] = [];
    let paramCount = 1;

    // Add each field that is present in the update object
    if (car.make !== undefined) {
      updates.push(`make = $${paramCount++}`);
      values.push(car.make);
    }
    if (car.model !== undefined) {
      updates.push(`model = $${paramCount++}`);
      values.push(car.model);
    }
    if (car.year !== undefined) {
      updates.push(`year = $${paramCount++}`);
      values.push(car.year);
    }
    if (car.vin !== undefined) {
      updates.push(`vin = $${paramCount++}`);
      values.push(car.vin);
    }
    if (car.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(car.name);
    }

    // If no fields to update, return early
    if (updates.length === 0) {
      return this.findById(id);
    }

    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add the id as the last parameter
    values.push(id);

    const query = `
      UPDATE cars 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      return undefined;
    }

    return this.mapRowToCar(result.rows[0]);
  }

  async softDelete(id: string): Promise<void> {
    const query = `
      UPDATE cars 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    await this.db.query(query, [id]);
  }

  private mapRowToCar(row: CarRow): Car {
    return {
      id: row.id,
      make: row.make,
      model: row.model,
      year: row.year,
      vin: row.vin,
      name: row.name,
      user_id: row.user_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at
    };
  }
} 