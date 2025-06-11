import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

interface DBConfig {
  HOST: string;
  PORT: number;
  NAME: string;
  USER: string;
  PASSWORD: string;
}

interface JWTConfig {
  SECRET: string;
  EXPIRES_IN: string;
}

interface EnvConfig {
  DB: DBConfig;
  JWT: JWTConfig;
  NODE_ENV: string;
  PORT: number;
}

export const env: EnvConfig = {
  DB: {
    HOST: '',
    PORT: 5432,
    NAME: '',
    USER: '',
    PASSWORD: ''
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'default-dev-secret',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d'
  },
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000')
};

const ssmClient = new SSMClient({});

async function getSSMParameter(parameterName: string): Promise<string> {
  const command = new GetParameterCommand({
    Name: parameterName,
    WithDecryption: true
  });

  const response = await ssmClient.send(command);
  if (!response.Parameter?.Value) {
    throw new Error(`Parameter ${parameterName} not found`);
  }

  return response.Parameter.Value;
}

export async function getConfig(environment: string): Promise<void> {
  const dbHost = await getSSMParameter(`/autostat/${environment}/db/host`);
  const dbPort = await getSSMParameter(`/autostat/${environment}/db/port`);
  const dbName = await getSSMParameter(`/autostat/${environment}/db/name`);
  const dbUser = await getSSMParameter(`/autostat/${environment}/db/username`);
  const dbPassword = await getSSMParameter(`/autostat/${environment}/db/password`);

  env.DB = {
    HOST: dbHost,
    PORT: parseInt(dbPort),
    NAME: dbName,
    USER: dbUser,
    PASSWORD: dbPassword
  };
}