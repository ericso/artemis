import { 
  LambdaClient, 
  UpdateFunctionCodeCommand,
  GetFunctionCommand,
  CreateFunctionCommand,
  UpdateFunctionConfigurationCommand,
  Runtime
} from '@aws-sdk/client-lambda';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const LAMBDA_NAME = 'autostat-db-migrate';
const LAMBDA_ROLE = 'arn:aws:iam::857736876364:role/autostat-db-migrate-role';

const functionConfig = {
  Runtime: Runtime.nodejs18x,
  Role: LAMBDA_ROLE,
  Handler: 'migrate.handler',
  Timeout: 900, // 15 minutes
  MemorySize: 1024, // 1 GB
  VpcConfig: {
    SubnetIds: [
      'subnet-0c76659803ffe1f1b', // us-east-1a
      'subnet-011fc62b3a8b650a4'  // us-east-1b
    ],
    SecurityGroupIds: [
      'sg-0486f6e607701375d' // autostat-lambda-sg
    ]
  },
  Environment: {
    Variables: {
      NODE_ENV: 'dev'
    }
  }
};

async function deployLambda() {
  try {
    const lambdaClient = new LambdaClient({ region: 'us-east-1' });
    const zipBuffer = readFileSync(resolve(__dirname, '../dist/lambda/migrate.zip'));

    try {
      // Check if function exists
      await lambdaClient.send(new GetFunctionCommand({ FunctionName: LAMBDA_NAME }));
      
      // Update function configuration
      console.log('Updating function configuration...');
      await lambdaClient.send(new UpdateFunctionConfigurationCommand({
        FunctionName: LAMBDA_NAME,
        ...functionConfig
      }));
      
      // Wait for configuration update to complete
      console.log('Waiting for configuration update to complete...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Update function code
      console.log('Updating function code...');
      await lambdaClient.send(new UpdateFunctionCodeCommand({
        FunctionName: LAMBDA_NAME,
        ZipFile: zipBuffer
      }));
      
      console.log('Lambda function updated successfully');
    } catch (error: any) {
      if (error.name === 'ResourceNotFoundException') {
        // Create new function
        console.log('Creating new Lambda function...');
        await lambdaClient.send(new CreateFunctionCommand({
          FunctionName: LAMBDA_NAME,
          Code: {
            ZipFile: zipBuffer
          },
          ...functionConfig
        }));
        
        console.log('Lambda function created successfully');
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Failed to deploy Lambda:', error);
    process.exit(1);
  }
}

deployLambda(); 