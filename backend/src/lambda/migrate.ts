import { Handler } from 'aws-lambda';
import { migrate } from '../db/migrate';

interface MigrationEvent {
  direction?: 'up' | 'down';
  environment?: string;
}

interface MigrationResponse {
  statusCode: number;
  body: string;
}

export const handler: Handler<MigrationEvent, MigrationResponse> = async (event) => {
  try {
    const direction = event.direction || 'up';
    const environment = event.environment || 'dev';

    await migrate(direction, environment);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Migration ${direction} completed successfully`,
        environment
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Migration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}; 