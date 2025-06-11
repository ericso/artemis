import { PoolClient } from 'pg';

export async function up(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS cars (
      id UUID PRIMARY KEY,
      make VARCHAR NOT NULL,
      model VARCHAR NOT NULL,
      year INTEGER NOT NULL,
      vin VARCHAR DEFAULT NULL,
      name VARCHAR NULL,
      user_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  await client.query(`
    COMMENT ON COLUMN cars.name IS 'Optional custom name given to the car by the owner'
  `);
}

export async function down(client: PoolClient): Promise<void> {
  await client.query('DROP TABLE IF EXISTS cars CASCADE');
} 