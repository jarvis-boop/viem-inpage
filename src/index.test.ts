import { describe, expect, it } from 'bun:test';

describe('viem-inpage', () => {
  it('should export createInpageClient', async () => {
    const { createInpageClient } = await import('./index.js');
    expect(createInpageClient).toBeDefined();
    expect(typeof createInpageClient).toBe('function');
  });

  it('should export createInpageProvider', async () => {
    const { createInpageProvider } = await import('./index.js');
    expect(createInpageProvider).toBeDefined();
    expect(typeof createInpageProvider).toBe('function');
  });

  it('should export InpageProvider class', async () => {
    const { InpageProvider } = await import('./index.js');
    expect(InpageProvider).toBeDefined();
    expect(typeof InpageProvider).toBe('function');
  });
});
