/* eslint-disable no-console */
/**
 * AWS Lambda handler for the API.
 * Console logs are intentionally used here as they are required for AWS CloudWatch logging.
 */

import './register-paths';
import { Handler, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import serverless from 'serverless-http';
import app from './app';
import { env } from './config/env';

// Create a wrapper handler to handle CORS preflight
const wrappedHandler = serverless(app);

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Environment:', {
    NODE_ENV: env.NODE_ENV,
    FRONTEND_URL: env.FRONTEND_URL,
    DB_HOST: env.DB.HOST,
    DB_NAME: env.DB.NAME,
    DB_PORT: env.DB.PORT,
  });

  try {
    // Handle OPTIONS preflight request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': env.FRONTEND_URL,
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Max-Age': '86400',
          'Access-Control-Allow-Credentials': 'false'
        },
        body: ''
      };
    }

    // For all other requests, use the serverless-http wrapped app
    const result = await wrappedHandler(event, context) as APIGatewayProxyResult;
    
    // Ensure CORS headers are set on all responses
    result.headers = {
      ...result.headers,
      'Access-Control-Allow-Origin': env.FRONTEND_URL,
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'false'
    };

    return result;
  } catch (error: Error | unknown) {
    console.error('Lambda handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.FRONTEND_URL,
      },
      body: JSON.stringify({ message: 'Internal Server Error', error: errorMessage })
    };
  }
}; 