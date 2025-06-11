import { resolve } from 'path';
import { register } from 'tsconfig-paths';
import { readFileSync } from 'fs';
import { vi } from 'vitest';

// Load the tsconfig.json
const baseUrl = resolve(__dirname, '..');
const tsConfigPath = resolve(__dirname, '../../tsconfig.json');
const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf-8'));
const { paths } = tsConfig.compilerOptions;

// Register the path aliases
register({
  baseUrl,
  paths
});

// Mock environment configuration for tests
process.env.NODE_ENV = 'test';

// Mock the config module
vi.mock('@config/env', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: 3000,
    FRONTEND_URL: 'http://localhost:5173',
    JWT: {
      SECRET: 'test-jwt-secret',
      EXPIRES_IN: '24h'
    },
    DB: {
      USER: 'test_user',
      HOST: 'localhost',
      NAME: 'test_db',
      PASSWORD: 'test_password',
      PORT: 5432,
    }
  }
})); 