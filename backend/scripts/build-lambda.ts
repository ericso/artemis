import * as esbuild from 'esbuild';
import { resolve } from 'path';
import { mkdirSync, copyFileSync } from 'fs';

async function build() {
  try {
    const distDir = resolve(__dirname, '../dist/lambda');
    const configDir = resolve(distDir, 'config');
    
    // Create directories if they don't exist
    mkdirSync(distDir, { recursive: true });
    mkdirSync(configDir, { recursive: true });
    
    // Build the Lambda function
    await esbuild.build({
      entryPoints: [resolve(__dirname, '../src/lambda/migrate.ts')],
      bundle: true,
      minify: true,
      sourcemap: true,
      platform: 'node',
      target: 'node18',
      outfile: resolve(distDir, 'migrate.js'),
      external: ['pg-native'], // Exclude native modules
    });
    
    // Copy config files
    console.log('Copying config files...');
    copyFileSync(
      resolve(__dirname, '../config/dev.env.json'),
      resolve(configDir, 'dev.env.json')
    );
    
    console.log('Lambda build completed successfully');
  } catch (error) {
    console.error('Lambda build failed:', error);
    process.exit(1);
  }
}

build(); 