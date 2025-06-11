import { resolve } from 'path';
import { readFileSync } from 'fs';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

interface EnvConfig {
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_PORT: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
}

const ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });

async function resolveSSMParameter(paramRef: string): Promise<string> {
  // Extract the actual parameter name from the reference
  // e.g. "${ssm:/artemis/dev/db/host}" -> "/artemis/dev/db/host"
  const paramName = paramRef.match(/\${ssm:([^}]+)}/)?.[1];
  if (!paramName) {
    return paramRef; // Return as-is if not an SSM reference
  }

  try {
    console.log(`Resolving SSM parameter: ${paramName}`);
    const command = new GetParameterCommand({
      Name: paramName,
      WithDecryption: true,
    });
    const response = await ssmClient.send(command);
    const value = response.Parameter?.Value || paramRef;
    console.log(`Resolved ${paramName} to: ${paramName.includes('password') ? '******' : value}`);
    return value;
  } catch (error) {
    console.error(`Failed to resolve SSM parameter ${paramName}:`, error);
    throw error;
  }
}

async function loadConfig(environment: string = 'local'): Promise<EnvConfig> {
  console.log('Loading config for environment:', environment);
  
  const configPath = resolve(__dirname, `../../config/${environment}.env.json`);
  try {
    console.log(`Loading config from: ${configPath}`);
    const rawConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
    console.log('Raw config loaded:', {
      ...rawConfig,
      DB_PASSWORD: '******',
      JWT_SECRET: '******'
    });
    
    // Resolve all SSM parameters
    const resolvedConfig: EnvConfig = {
      DB_HOST: await resolveSSMParameter(rawConfig.DB_HOST),
      DB_USER: await resolveSSMParameter(rawConfig.DB_USER),
      DB_PASSWORD: await resolveSSMParameter(rawConfig.DB_PASSWORD),
      DB_NAME: await resolveSSMParameter(rawConfig.DB_NAME),
      DB_PORT: await resolveSSMParameter(rawConfig.DB_PORT),
      JWT_SECRET: await resolveSSMParameter(rawConfig.JWT_SECRET),
      FRONTEND_URL: await resolveSSMParameter(rawConfig.FRONTEND_URL),
    };

    return resolvedConfig;
  } catch (error) {
    console.error(`Failed to load config for ${environment} environment`);
    console.error(`Make sure ${configPath} exists and is properly formatted`);
    console.error(`You can copy ${environment}.example.json to ${environment}.env.json and update the values`);
    throw error;
  }
}

// Initialize config
let configPromise: Promise<EnvConfig>;
let cachedConfig: EnvConfig | null = null;
let currentEnvironment: string | null = null;

async function getConfig(environment?: string): Promise<EnvConfig> {
  if (cachedConfig && environment === currentEnvironment) {
    return cachedConfig;
  }
  
  currentEnvironment = environment || 'local';
  configPromise = loadConfig(currentEnvironment);
  cachedConfig = await configPromise;
  return cachedConfig;
}

// Export the config getter
export const env = {
  get DB() {
    if (!cachedConfig) {
      throw new Error('Configuration not loaded. Call await getConfig() first.');
    }
    return {
      USER: cachedConfig.DB_USER,
      HOST: cachedConfig.DB_HOST,
      NAME: cachedConfig.DB_NAME,
      PASSWORD: cachedConfig.DB_PASSWORD,
      PORT: parseInt(cachedConfig.DB_PORT),
    };
  },
  get JWT_SECRET() {
    if (!cachedConfig) {
      throw new Error('Configuration not loaded. Call await getConfig() first.');
    }
    return cachedConfig.JWT_SECRET;
  },
  get FRONTEND_URL() {
    if (!cachedConfig) {
      throw new Error('Configuration not loaded. Call await getConfig() first.');
    }
    return cachedConfig.FRONTEND_URL;
  },
  get NODE_ENV() {
    return currentEnvironment || 'local';
  }
};

export { getConfig };