import { PoolClient } from 'pg';

export async function up(client: PoolClient): Promise<void> {
  // Create function to update updated_at timestamp
  await client.query(`
    CREATE OR REPLACE FUNCTION cascade_soft_delete()
    RETURNS TRIGGER AS $$
    BEGIN
      -- If this is a soft delete (deleted_at is being set from NULL to a timestamp)
      IF (TG_OP = 'UPDATE' AND OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL) THEN
        -- For users table, cascade to cars
        IF (TG_TABLE_NAME = 'users') THEN
          UPDATE cars
          SET deleted_at = NEW.deleted_at
          WHERE user_id = OLD.id AND deleted_at IS NULL;
        END IF;

        -- For cars table, cascade to fillups
        IF (TG_TABLE_NAME = 'cars') THEN
          UPDATE fillups
          SET deleted_at = NEW.deleted_at
          WHERE car_id = OLD.id AND deleted_at IS NULL;
        END IF;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create triggers for each table
  await client.query(`
    CREATE TRIGGER users_soft_delete_trigger
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION cascade_soft_delete();
  `);

  await client.query(`
    CREATE TRIGGER cars_soft_delete_trigger
    AFTER UPDATE ON cars
    FOR EACH ROW
    EXECUTE FUNCTION cascade_soft_delete();
  `);
}

export async function down(client: PoolClient): Promise<void> {
  // Drop triggers
  await client.query('DROP TRIGGER IF EXISTS users_soft_delete_trigger ON users;');
  await client.query('DROP TRIGGER IF EXISTS cars_soft_delete_trigger ON cars;');

  // Drop function
  await client.query('DROP FUNCTION IF EXISTS cascade_soft_delete;');
} 