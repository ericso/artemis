import { PoolClient } from 'pg';

export async function up(client: PoolClient): Promise<void> {
  await client.query(`
    ALTER TABLE cars
    ADD COLUMN initial_mileage INTEGER DEFAULT 0;
  `);
  
  await client.query(`
    COMMENT ON COLUMN cars.initial_mileage IS 'Initial odometer reading when the car was added to the system'
  `);
}

export async function down(client: PoolClient): Promise<void> {
  await client.query(`
    ALTER TABLE cars
    DROP COLUMN initial_mileage;
  `);
} 