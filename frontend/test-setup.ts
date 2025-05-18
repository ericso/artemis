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