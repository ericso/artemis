import { Handler, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import serverless from 'serverless-http';
import app from './app';
import { env } from './config/env';

// Create a wrapper handler to handle CORS preflight
const wrappedHandler = serverless(app);

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
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
}; 