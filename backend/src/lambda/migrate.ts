import { Handler } from 'aws-lambda';
import { migrate } from '../db/migrate';
import { getConfig } from '../config/env';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

// Load config during cold start
const devConfig = JSON.parse(readFileSync(resolve(__dirname, './config/dev.env.json'), 'utf-8'));

async function resolveSSMParameter(paramRef: string): Promise<string> {
  const paramName = paramRef.match(/\${ssm:([^}]+)}/)?.[1];
  if (!paramName) {
    return paramRef;
  }

  try {
    console.log(`Resolving SSM parameter: ${paramName}`);
    const ssmClient = new SSMClient({ 
      region: process.env.AWS_REGION || 'us-east-1'
    });
    const command = new GetParameterCommand({
      Name: paramName,
      WithDecryption: true,
    });
    
    try {
      const response = await ssmClient.send(command);
      const value = response.Parameter?.Value;
      if (!value) {
        throw new Error(`No value returned for parameter ${paramName}`);
      }
      console.log(`Resolved ${paramName} to: ${paramName.includes('password') ? '******' : value}`);
      return value;
    } catch (error: any) {
      if (error.name === 'ParameterNotFound') {
        throw new Error(`SSM parameter ${paramName} not found. Please ensure the parameter exists in AWS Systems Manager Parameter Store.`);
      }
      throw error;
    }
  } catch (error) {
    console.error(`Failed to resolve SSM parameter ${paramName}:`, error);
    throw error;
  }
}

export const handler: Handler = async (event) => {
  try {
    const direction = event.direction || 'up';
    const environment = event.environment || 'dev';
    
    console.log(`Starting database migration: direction=${direction}, environment=${environment}`);
    
    // Resolve SSM parameters and set environment variables
    try {
      for (const [key, value] of Object.entries(devConfig)) {
        process.env[key] = await resolveSSMParameter(value as string);
      }
    } catch (error) {
      console.error('Failed to resolve SSM parameters. Please check that all required parameters exist in AWS Systems Manager Parameter Store.');
      throw error;
    }
    
    await migrate(direction as 'up' | 'down', environment);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully ran migrations ${direction} in ${environment} environment`
      })
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Migration failed',
        error: error instanceof Error ? error.message : String(error)
      })
    };
  }
} 