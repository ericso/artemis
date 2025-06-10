/* eslint-disable no-console */
/**
 * AWS Lambda handler for the API.
 * Console logs are intentionally used here as they are required for AWS CloudWatch logging.
 */

import './register-paths';
import serverless from 'serverless-http';
import app from './app';
import { Handler, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const serverlessHandler = serverless(app);

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    const result = await serverlessHandler(event, context) as APIGatewayProxyResult;
    return result;
  } catch (error) {
    console.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};

// Also export as main for compatibility
export const main = handler; 