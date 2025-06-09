import { pool } from '@config/database';
import * as createUsersTable from './migrations/001_create_users_table';
import * as createCarsTable from './migrations/002_create_cars_table';
import * as createFillupsTable from './migrations/003_create_fillups_table';
import * as addInitialMileageToCars from './migrations/004_add_initial_mileage_to_cars';

async function migrate(direction: 'up' | 'down' = 'up') {
  try {
    if (direction === 'up') {
      await createUsersTable.up();
      await createCarsTable.up();
      await createFillupsTable.up();
      await addInitialMileageToCars.up();
      console.log('Migrations completed successfully');
    } else {
      await addInitialMileageToCars.down();
      await createFillupsTable.down();
      await createCarsTable.down();
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