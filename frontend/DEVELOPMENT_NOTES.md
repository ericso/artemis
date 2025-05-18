# Development Notes

## Test Environment Setup

### Crypto Polyfill Solution

We encountered and resolved an issue with `crypto.getRandomValues` in the test environment, particularly in CI. The solution involves proper initialization of the WebCrypto API in our test setup.

#### Implementation Details

The solution is implemented in `test-setup.ts`:
```typescript
async function setupCrypto() {
    try {
        const { webcrypto } = await import('node:crypto');
        
        if (!globalThis.crypto || !globalThis.crypto.getRandomValues) {
            Object.defineProperty(globalThis, 'crypto', {
                value: webcrypto,
                writable: false,
                configurable: false
            });
        }
        
        if (!global.crypto || !global.crypto.getRandomValues) {
            Object.defineProperty(global, 'crypto', {
                value: webcrypto,
                writable: false,
                configurable: false
            });
        }
    } catch (error) {
        console.error('Failed to setup crypto:', error);
        throw error;
    }
}

// Run setup before tests
await setupCrypto();

// Make this file a module
export {};
```

Key aspects of the solution:
- Uses dynamic import for the crypto module
- Properly sets up crypto on both `global` and `globalThis`
- Includes error handling and logging
- Makes the setup file a proper ES module

### CI Configuration

The GitHub Actions workflow is configured to:
- Support both Node.js 18.x (LTS) and 20.x
- Use necessary Node.js flags for ESM support
- Maintain test isolation

Key configuration in `.github/workflows/frontend.yml`:
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]

# ...

env:
  NODE_OPTIONS: --experimental-vm-modules
  VITEST_MAX_THREADS: 1
```

### Important Notes

1. The `--experimental-vm-modules` flag is required for ESM support in the test environment
2. Setting `VITEST_MAX_THREADS: 1` helps prevent race conditions in tests
3. The solution works with both Node.js 18.x (LTS) and 20.x
4. The crypto polyfill is essential for any tests that rely on cryptographic functions 