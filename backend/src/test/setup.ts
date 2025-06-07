import { resolve } from 'path';
import { register } from 'tsconfig-paths';

// Load the tsconfig.json
const baseUrl = resolve(__dirname, '..');
const { paths } = require('../../tsconfig.json').compilerOptions;

// Register the path aliases
register({
  baseUrl,
  paths
}); 