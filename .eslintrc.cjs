module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    // Shared rules for both frontend and backend
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn'
  },
  overrides: [
    // Frontend specific configuration
    {
      files: ['frontend/**/*.{ts,tsx}'],
      env: {
        browser: true
      },
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      plugins: [
        'react',
        'react-hooks'
      ],
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/jsx-uses-react': 'off'
      },
      settings: {
        react: {
          version: 'detect'
        }
      }
    },
    // Backend specific configuration
    {
      files: ['backend/**/*.ts'],
      env: {
        node: true
      },
      rules: {
        // Add any backend-specific rules here
      }
    },
    // Test files configuration
    {
      files: ['**/*.{test,spec}.{ts,tsx}'],
      env: {
        'vitest-globals/env': true
      },
      extends: ['plugin:vitest-globals/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
}; 