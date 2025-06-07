import { resolve } from 'path';
import { register } from 'tsconfig-paths';
import { readFileSync } from 'fs';

// Load the tsconfig.json
const baseUrl = resolve(__dirname, '..');
const tsConfig = JSON.parse(readFileSync('../../tsconfig.json', 'utf-8'));
const { paths } = tsConfig.compilerOptions;

// Register the path aliases
register({
  baseUrl,
  paths
}); 