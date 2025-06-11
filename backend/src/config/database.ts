import { Pool } from 'pg';
import { getSSMParameter } from './ssm';

export let pool: Pool | null = null;

export async function getPool(environment: string = 'local'): Promise<Pool> {
  if (pool) {
    return pool;
  }

  const host = await getSSMParameter(`/autostat/${environment}/db/host`);
  const port = await getSSMParameter(`/autostat/${environment}/db/port`);
  const database = await getSSMParameter(`/autostat/${environment}/db/name`);
  const user = await getSSMParameter(`/autostat/${environment}/db/username`);
  const password = await getSSMParameter(`/autostat/${environment}/db/password`);

  pool = new Pool({
    host,
    port: parseInt(port),
    database,
    user,
    password,
    ssl: {
      rejectUnauthorized: false
    }
  });

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
} 