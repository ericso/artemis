import { Pool } from 'pg';

export async function up(db: Pool): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS cars (
      id UUID PRIMARY KEY,
      vin VARCHAR DEFAULT NULL,
      name VARCHAR NULL,
      make VARCHAR NOT NULL,
      model VARCHAR NOT NULL,
      year INTEGER NOT NULL,
      user_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  await db.query(`
    COMMENT ON COLUMN cars.name IS 'Optional custom name given to the car by the owner'
  `);
}

export async function down(db: Pool): Promise<void> {
  await db.query('DROP TABLE IF EXISTS cars CASCADE');
} 