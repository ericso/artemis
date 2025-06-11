import { LambdaClient, InvokeCommand, LogType } from '@aws-sdk/client-lambda';

const LAMBDA_NAME = 'autostat-db-migrate';

async function invokeMigration(direction: 'up' | 'down' = 'up', environment: string = 'dev') {
  try {
    const lambdaClient = new LambdaClient({ region: 'us-east-1' });
    
    console.log(`Invoking migration Lambda: direction=${direction}, environment=${environment}`);
    console.log('This may take a few minutes...');
    
    const response = await lambdaClient.send(new InvokeCommand({
      FunctionName: LAMBDA_NAME,
      Payload: Buffer.from(JSON.stringify({ direction, environment })),
      LogType: LogType.Tail,
      InvocationType: 'RequestResponse' // This ensures we wait for the Lambda to complete
    }));

    // Always show the logs first
    if (response.LogResult) {
      console.log('\nLambda Logs:');
      console.log(Buffer.from(response.LogResult, 'base64').toString());
    }
    
    if (response.FunctionError) {
      console.error('\nMigration failed!');
      const error = JSON.parse(Buffer.from(response.Payload!).toString());
      console.error(`Error Type: ${error.errorType}`);
      console.error(`Message: ${error.errorMessage}`);
      if (error.trace) {
        console.error('\nStacktrace:');
        error.trace.forEach((line: string) => console.error(line));
      }
      process.exit(1);
    }
    
    const result = JSON.parse(Buffer.from(response.Payload!).toString());
    console.log('\nMigration Result:', result);
    
    if (result.statusCode === 200) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.error('\n❌ Migration failed with status code:', result.statusCode);
      process.exit(1);
    }
  } catch (error) {
    console.error('\nFailed to invoke migration Lambda:', error);
    process.exit(1);
  }
}

// Get direction and environment from command line arguments
const direction = process.argv[2] as 'up' | 'down' | undefined;
const environment = process.argv[3] || 'dev';

if (!direction || !['up', 'down'].includes(direction)) {
  console.error('Error: direction must be either "up" or "down"');
  console.error('Usage: npm run migrate:lambda <up|down> [environment]');
  process.exit(1);
}

invokeMigration(direction, environment); 