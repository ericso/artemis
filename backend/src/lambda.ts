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

const getAllowedOrigin = (origin: string | undefined): string | undefined => {
  // Log the incoming origin
  console.log('Incoming Origin:', origin);
  
  const allowedOrigins = [
    'http://localhost:5173',
    'http://autostat-frontend-dev.s3-website-us-east-1.amazonaws.com',
    'https://autostat.app',
    'https://d26x71430m93jn.cloudfront.net'
  ];
  
  // Log all request headers for debugging
  console.log('Allowed Origins:', allowedOrigins);
  
  // If no origin or not in allowed list, return undefined to prevent CORS header from being set
  if (!origin || !allowedOrigins.includes(origin)) {
    console.log('Origin not allowed:', origin);
    return undefined;
  }
  
  console.log('Using origin:', origin);
  return origin;
};

interface CorsHeaders {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Credentials': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
  'Vary': string;
}

const normalizeHeaderCase = (headers: { [key: string]: string | number | boolean | undefined }): { [key: string]: string | undefined } => {
  const normalized: { [key: string]: string | undefined } = {};
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = value?.toString();
  }
  return normalized;
};

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    const result = await serverlessHandler(event, context) as APIGatewayProxyResult;
    const origin = event.headers?.origin || event.headers?.Origin;
    const allowedOrigin = getAllowedOrigin(origin);
    
    // Log headers for debugging
    console.log('Request Headers:', event.headers);
    
    // Normalize existing headers to lowercase for comparison
    const existingHeaders = normalizeHeaderCase(result.headers || {});
    console.log('Existing Response Headers:', existingHeaders);
    
    // Only add CORS headers if they're not already present
    const corsHeaders: Partial<CorsHeaders> = {};
    
    if (allowedOrigin) {
      if (!existingHeaders['access-control-allow-origin']) {
        corsHeaders['Access-Control-Allow-Origin'] = allowedOrigin;
      }
      if (!existingHeaders['access-control-allow-credentials']) {
        corsHeaders['Access-Control-Allow-Credentials'] = 'true';
      }
      if (!existingHeaders['access-control-allow-methods']) {
        corsHeaders['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
      }
      if (!existingHeaders['access-control-allow-headers']) {
        corsHeaders['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent';
      }
      if (!existingHeaders['vary']) {
        corsHeaders['Vary'] = 'Origin';
      }
    }

    result.headers = {
      ...result.headers,
      ...corsHeaders
    };
    
    // Log final response
    console.log('Final Response:', {
      statusCode: result.statusCode,
      headers: result.headers
    });
    
    return result;
  } catch (error) {
    console.error('Lambda handler error:', error);
    const origin = event.headers?.origin || event.headers?.Origin;
    const allowedOrigin = getAllowedOrigin(origin);
    
    const corsHeaders: Partial<CorsHeaders> = allowedOrigin ? {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
      'Vary': 'Origin'
    } : {};

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};

// Also export as main for compatibility
export const main = handler; 