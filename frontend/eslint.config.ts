import { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import { Linter } from 'eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginVitest from '@vitest/eslint-plugin';
import pluginCypress from 'eslint-plugin-cypress/flat';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const config: FlatConfig.Config[] = [
  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**']
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': pluginReact,
      'react-hooks': pluginReactHooks
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/__tests__/**/*.{ts,tsx}'],
    ...pluginVitest.configs.recommended
  },
  {
    files: [
      'cypress/e2e/**/*.{cy,spec}.{ts,tsx}',
      'cypress/support/**/*.{ts,tsx}'
    ],
    ...pluginCypress.configs.recommended
  }
];

export default config;
