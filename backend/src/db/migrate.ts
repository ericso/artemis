import { pool } from '@config/database';
import * as createUsersTable from './migrations/001_create_users_table';

async function migrate(direction: 'up' | 'down' = 'up') {
  try {
    if (direction === 'up') {
      await createUsersTable.up();
      console.log('Migrations completed successfully');
    } else {
      await createUsersTable.down();
      console.log('Migrations rolled back successfully');
    }
  } catch (error) {
    console.error(`Migration ${direction} failed:`, error);
  } finally {
    await pool.end();
  }
}

const direction = process.argv[2] as 'up' | 'down' | undefined;
migrate(direction); 