import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({});

export async function getSSMParameter(parameterName: string): Promise<string> {
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