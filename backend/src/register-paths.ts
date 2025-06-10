/**
 * This file is responsible for registering TypeScript path aliases in the compiled JavaScript code.
 * 
 * When TypeScript code is compiled to JavaScript, the path aliases (e.g., @routes/*, @services/*)
 * defined in tsconfig.json are not automatically translated. This causes issues in the Lambda
 * environment where these imports would fail.
 * 
 * This module uses tsconfig-paths to register these aliases at runtime, ensuring that imports
 * using @ aliases work correctly in the compiled JavaScript code. It must be imported before
 * any other modules that use these path aliases.
 * 
 * Example:
 * - TypeScript: import { AuthRoutes } from '@routes/auth.routes'
 * - Becomes working JavaScript: import { AuthRoutes } from './routes/auth.routes'
 */

import { register } from 'tsconfig-paths';
import { join } from 'path';

// Load tsconfig.json using require since we're in a CommonJS environment
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsConfig = require('./tsconfig.json');

// Register path aliases for the compiled JavaScript
register({
  baseUrl: join(__dirname),
  paths: tsConfig.compilerOptions.paths
}); 