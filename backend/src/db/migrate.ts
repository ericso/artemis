import * as createUsersTable from './migrations/001_create_users_table';
import * as createCarsTable from './migrations/002_create_cars_table';
import * as createFillupsTable from './migrations/003_create_fillups_table';
import * as addInitialMileageToCars from './migrations/004_add_initial_mileage_to_cars';
import * as addSoftDeleteTriggers from './migrations/005_add_soft_delete_triggers';
import readline from 'readline';
import { getPool, closePool } from '@config/database';
import { PoolClient } from 'pg';

interface Migration {
  name: string;
  up: (client: PoolClient) => Promise<void>;
  down: (client: PoolClient) => Promise<void>;
}

const migrations: Migration[] = [
  { name: '001_create_users_table', ...createUsersTable },
  { name: '002_create_cars_table', ...createCarsTable },
  { name: '003_create_fillups_table', ...createFillupsTable },
  { name: '004_add_initial_mileage_to_cars', ...addInitialMileageToCars },
  { name: '005_add_soft_delete_triggers', ...addSoftDeleteTriggers },
];

async function createMigrationsTableIfNotExists(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getExecutedMigrations(client: PoolClient): Promise<string[]> {
  const result = await client.query('SELECT name FROM migrations ORDER BY id');
  return result.rows.map(row => row.name);
}

async function recordMigration(client: PoolClient, name: string): Promise<void> {
  await client.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
}

async function removeMigration(client: PoolClient, name: string): Promise<void> {
  await client.query('DELETE FROM migrations WHERE name = $1', [name]);
}

async function confirmRollback(environment: string): Promise<boolean> {
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return true;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`\n⚠️  WARNING: You are about to roll back all migrations in the ${environment} environment!`);
  console.log('This will:');
  console.log('1. Drop all tables');
  console.log('2. Delete all data');
  console.log('3. Drop the migrations table');
  console.log('\nThis action cannot be undone!\n');

  return new Promise((resolve) => {
    rl.question(`Are you sure you want to proceed? Type "MIGRATE-DOWN-${environment.toUpperCase()}" to confirm: `, (answer) => {
      rl.close();
      resolve(answer === `MIGRATE-DOWN-${environment.toUpperCase()}`);
    });
  });
}

async function migrate(direction: 'up' | 'down' = 'up', environment: string = 'local'): Promise<void> {
  console.log(`Running ${direction} migrations in ${environment} environment...`);
  
  const pool = await getPool(environment);
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    await createMigrationsTableIfNotExists(client);
    
    if (direction === 'up') {
      const executedMigrations = await getExecutedMigrations(client);
      console.log('\nPending migrations:');
      
      for (const migration of migrations) {
        if (!executedMigrations.includes(migration.name)) {
          console.log(`  → Executing migration: ${migration.name}`);
          await migration.up(client);
          await recordMigration(client, migration.name);
          console.log(`  ✓ Completed migration: ${migration.name}`);
        } else {
          console.log(`  • Skipping migration: ${migration.name} (already executed)`);
        }
      }
    } else {
      const confirmed = await confirmRollback(environment);
      if (!confirmed) {
        console.log('Down-migration cancelled.');
        process.exit(0);
      }

      const executedMigrations = await getExecutedMigrations(client);
      console.log('\nRolling back migrations:');
      
      for (const migration of [...migrations].reverse()) {
        if (executedMigrations.includes(migration.name)) {
          console.log(`  → Rolling back migration: ${migration.name}`);
          await migration.down(client);
          await removeMigration(client, migration.name);
          console.log(`  ✓ Rolled back migration: ${migration.name}`);
        } else {
          console.log(`  • Skipping rollback: ${migration.name} (not executed)`);
        }
      }

      await client.query('DROP TABLE IF EXISTS migrations CASCADE');
    }

    await client.query('COMMIT');
    console.log('\nMigration completed successfully!\n');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\nMigration failed:', error);
    throw error;
  } finally {
    client.release();
    await closePool();
  }
}

const direction = process.argv[2] as 'up' | 'down' | undefined;
const environment = process.argv[3] || 'local';

if (require.main === module) {
  migrate(direction, environment).catch(console.error);
}

export { migrate }; 