import { Pool } from 'pg';
import { pool } from '@config/database';

export async function up(db: Pool = pool): Promise<void> {
  // Create a function to handle soft delete cascading
  await db.query(`
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

  // Create trigger for users table
  await db.query(`
    CREATE TRIGGER users_soft_delete_trigger
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION cascade_soft_delete();
  `);

  // Create trigger for cars table
  await db.query(`
    CREATE TRIGGER cars_soft_delete_trigger
    AFTER UPDATE ON cars
    FOR EACH ROW
    EXECUTE FUNCTION cascade_soft_delete();
  `);
}

export async function down(db: Pool = pool): Promise<void> {
  // Drop triggers
  await db.query('DROP TRIGGER IF EXISTS users_soft_delete_trigger ON users;');
  await db.query('DROP TRIGGER IF EXISTS cars_soft_delete_trigger ON cars;');
  
  // Drop function
  await db.query('DROP FUNCTION IF EXISTS cascade_soft_delete;');
} 