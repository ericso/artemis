import { Pool } from 'pg';
import { Fillup } from '@models/fillup';
import { FillupService } from '@services/fillup.service';
import { pool } from '@config/database';

interface FillupRow {
  id: string;
  car_id: string;
  date: Date;
  gallons: number;
  total_cost: number;
  odometer_reading: number;
  station_address: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

export class PostgresFillupService implements FillupService {
  constructor(private db: Pool = pool) {}

  async findById(id: string): Promise<Fillup | undefined> {
    const query = 'SELECT * FROM fillups WHERE id = $1 AND deleted_at IS NULL';
    const result = await this.db.query<FillupRow>(query, [id]);
    
    if (result.rows.length === 0) {
      return undefined;
    }

    return this.mapRowToFillup(result.rows[0]);
  }

  async findByCarId(carId: string): Promise<Fillup[]> {
    const query = 'SELECT * FROM fillups WHERE car_id = $1 AND deleted_at IS NULL ORDER BY date DESC';
    const result = await this.db.query<FillupRow>(query, [carId]);
    
    return result.rows.map(this.mapRowToFillup);
  }

  async create(fillup: Fillup): Promise<Fillup> {
    const query = `
      INSERT INTO fillups (
        id, car_id, date, gallons, total_cost, 
        odometer_reading, station_address, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      fillup.id,
      fillup.car_id,
      fillup.date,
      fillup.gallons,
      fillup.total_cost,
      fillup.odometer_reading,
      fillup.station_address,
      fillup.notes
    ];

    const result = await this.db.query<FillupRow>(query, values);
    return this.mapRowToFillup(result.rows[0]);
  }

  async update(id: string, fillup: Partial<Fillup>): Promise<Fillup | undefined> {
    // Build the update query dynamically based on the provided fields
    const updates: string[] = [];
    const values: (string | number | Date | null)[] = [];
    let paramCount = 1;

    // Add each field that is present in the update object
    if (fillup.car_id !== undefined) {
      updates.push(`car_id = $${paramCount++}`);
      values.push(fillup.car_id);
    }
    if (fillup.date !== undefined) {
      updates.push(`date = $${paramCount++}`);
      values.push(fillup.date);
    }
    if (fillup.gallons !== undefined) {
      updates.push(`gallons = $${paramCount++}`);
      values.push(fillup.gallons);
    }
    if (fillup.total_cost !== undefined) {
      updates.push(`total_cost = $${paramCount++}`);
      values.push(fillup.total_cost);
    }
    if (fillup.odometer_reading !== undefined) {
      updates.push(`odometer_reading = $${paramCount++}`);
      values.push(fillup.odometer_reading);
    }
    if (fillup.station_address !== undefined) {
      updates.push(`station_address = $${paramCount++}`);
      values.push(fillup.station_address);
    }
    if (fillup.notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(fillup.notes);
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
      UPDATE fillups 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await this.db.query<FillupRow>(query, values);

    if (result.rows.length === 0) {
      return undefined;
    }

    return this.mapRowToFillup(result.rows[0]);
  }

  async softDelete(id: string): Promise<void> {
    const query = `
      UPDATE fillups 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
    await this.db.query(query, [id]);
  }

  private mapRowToFillup(row: FillupRow): Fillup {
    return {
      id: row.id,
      car_id: row.car_id,
      date: row.date,
      gallons: row.gallons,
      total_cost: row.total_cost,
      odometer_reading: row.odometer_reading,
      station_address: row.station_address,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at
    };
  }
} 