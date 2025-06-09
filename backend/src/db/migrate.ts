import { pool } from '@config/database';
import * as createUsersTable from './migrations/001_create_users_table';
import * as createCarsTable from './migrations/002_create_cars_table';
import * as createFillupsTable from './migrations/003_create_fillups_table';
import * as addInitialMileageToCars from './migrations/004_add_initial_mileage_to_cars';
import * as addSoftDeleteTriggers from './migrations/005_add_soft_delete_triggers';

interface Migration {
  name: string;
  up: (db: typeof pool) => Promise<void>;
  down: (db: typeof pool) => Promise<void>;
}

const migrations: Migration[] = [
  { name: '001_create_users_table', ...createUsersTable },
  { name: '002_create_cars_table', ...createCarsTable },
  { name: '003_create_fillups_table', ...createFillupsTable },
  { name: '004_add_initial_mileage_to_cars', ...addInitialMileageToCars },
  { name: '005_add_soft_delete_triggers', ...addSoftDeleteTriggers },
];

async function createMigrationsTableIfNotExists(db: typeof pool): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getExecutedMigrations(): Promise<string[]> {
  try {
    const result = await pool.query('SELECT name FROM migrations ORDER BY id');
    return result.rows.map(row => row.name);
  } catch (error) {
    // If migrations table doesn't exist yet, return empty array
    return [];
  }
}

async function recordMigration(name: string): Promise<void> {
  await pool.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
}

async function removeMigration(name: string): Promise<void> {
  try {
    await pool.query('DELETE FROM migrations WHERE name = $1', [name]);
  } catch (error) {
    // If migrations table doesn't exist, that's fine - we're rolling back anyway
    console.log('Note: migrations table not found during rollback');
  }
}

async function migrate(direction: 'up' | 'down' = 'up') {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Always ensure migrations table exists before proceeding
    await createMigrationsTableIfNotExists(pool);
    
    if (direction === 'up') {
      const executedMigrations = await getExecutedMigrations();
      
      for (const migration of migrations) {
        if (!executedMigrations.includes(migration.name)) {
          console.log(`Running migration: ${migration.name}`);
          await migration.up(pool);
          await recordMigration(migration.name);
          console.log(`Completed migration: ${migration.name}`);
        } else {
          console.log(`Skipping already executed migration: ${migration.name}`);
        }
      }
    } else {
      const executedMigrations = await getExecutedMigrations();
      
      // Run migrations in reverse order for rollback
      for (const migration of [...migrations].reverse()) {
        if (executedMigrations.includes(migration.name)) {
          console.log(`Rolling back migration: ${migration.name}`);
          await migration.down(pool);
          await removeMigration(migration.name);
          console.log(`Completed rollback: ${migration.name}`);
        }
      }

      // Finally, drop the migrations table itself
      console.log('Dropping migrations table');
      await client.query('DROP TABLE IF EXISTS migrations CASCADE');
    }

    await client.query('COMMIT');
    console.log(`Migrations ${direction === 'up' ? 'completed' : 'rolled back'} successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Migration ${direction} failed:`, error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Get the migration direction from command line arguments
const direction = process.argv[2] as 'up' | 'down' | undefined;
migrate(direction).catch(console.error); 