import { Pool } from 'pg';

export async function up(db: Pool): Promise<void> {
  await db.query(`
    ALTER TABLE cars
    ADD COLUMN initial_mileage INTEGER DEFAULT 0;
  `);
  
  await db.query(`
    COMMENT ON COLUMN cars.initial_mileage IS 'Initial odometer reading when the car was added to the system'
  `);
}

export async function down(db: Pool): Promise<void> {
  await db.query(`
    ALTER TABLE cars
    DROP COLUMN initial_mileage;
  `);
} 