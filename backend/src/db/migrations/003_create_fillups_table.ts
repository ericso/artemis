import { PoolClient } from 'pg';

export async function up(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS fillups (
      id UUID PRIMARY KEY,
      car_id UUID NOT NULL,
      date TIMESTAMP WITH TIME ZONE NOT NULL,
      gallons DECIMAL(10,3) NOT NULL,
      total_cost DECIMAL(10,2) NOT NULL,
      odometer_reading INTEGER NOT NULL,
      station_address VARCHAR NULL,
      notes TEXT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      FOREIGN KEY (car_id) REFERENCES cars(id)
    )
  `);
  
  await client.query(`
    COMMENT ON TABLE fillups IS 'Records of vehicle gas fill-up events';
  `);
}

export async function down(client: PoolClient): Promise<void> {
  await client.query('DROP TABLE IF EXISTS fillups CASCADE');
} 