/**
 * viem-inpage - EIP-1193 provider from viem client
 *
 * @example
 * ```ts
 * import { createPublicClient, http } from 'viem';
 * import { createEip1193Provider } from 'viem-inpage';
 *
 * const client = createPublicClient({ transport: http() });
 * const provider = createEip1193Provider(client);
 *
 * // Use as window.ethereum
 * const accounts = await provider.request({ method: 'eth_requestAccounts' });
 * ```
 */

import type { JsonRpcRequest, JsonRpcResponse, Eip1193ProviderOptions } from "./types.js";

export { type JsonRpcRequest, type JsonRpcResponse, type Eip1193ProviderOptions } from "./types.js";

/**
 * Create an EIP-1193 provider from a viem client
 *
 * @param client - A viem client (PublicClient, WalletClient, etc.)
 * @param options - Optional custom methods and configuration
 * @returns EIP-1193 compatible provider
 */
export function createEip1193Provider(
  client: {
    chain?: { id: number };
    account?: { address: string };
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  },
  options?: Eip1193ProviderOptions,
): Eip1193Provider {
  return new Eip1193Provider(client, options);
}

/**
 * EIP-1193 compatible provider
 *
 * Wraps a viem client to provide a standard EIP-1193 interface.
 */
export class Eip1193Provider {
  /** Current chain ID */
  chainId?: string;

  /** Whether connected */
  connected = false;

  /** Whether this is Rainbow */
  isRainbow = true;

  /** Provider is ready */
  isReady = true;

  /** Provider is MetaMask-compatible */
  isMetaMask = true;

  /** Network version */
  networkVersion = "1";

  /** Selected address (for wallet clients) */
  selectedAddress?: string;

  private client: {
    chain?: { id: number };
    account?: { address: string };
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };
  private customHandlers?: Record<string, (params: unknown[]) => Promise<unknown>>;
  private _isConnected = false;
  private _listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  constructor(
    client: {
      chain?: { id: number };
      account?: { address: string };
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    },
    options?: Eip1193ProviderOptions,
  ) {
    this.client = client;
    this.customHandlers = options?.custom;
    this.isRainbow = options?.isRainbow ?? true;
    this.isMetaMask = options?.isMetaMask ?? true;
  }

  private _emit(event: string, ...args: unknown[]): void {
    this._listeners.get(event)?.forEach((listener) => listener(...args));
  }

  /**
   * Request method - EIP-1193 standard
   */
  async request(args: { method: string; params?: unknown[] }): Promise<unknown> {
    const { method, params = [] } = args;

    // Handle custom methods first
    if (this.customHandlers?.[method]) {
      return this.customHandlers[method](params);
    }

    // Standard Ethereum methods
    switch (method) {
      case "eth_chainId":
        return this.client.chain?.id ? `0x${this.client.chain.id.toString(16)}` : "0x1";

      case "eth_accounts": {
        const account = this.client.account;
        return account ? [account.address] : [];
      }

      case "eth_coinbase": {
        const account = this.client.account;
        return account?.address ?? null;
      }

      case "eth_requestAccounts": {
        const account = this.client.account;
        if (account) {
          this._isConnected = true;
          this.connected = true;
          this.selectedAddress = account.address;
          return [account.address];
        }
        return [];
      }

      case "net_version":
        return this.client.chain?.id?.toString() ?? "1";

      default:
        // Forward to viem client
        return this.client.request({ method, params });
    }
  }

  /**
   * Enable - legacy method
   */
  async enable(): Promise<string[]> {
    const result = await this.request({ method: "eth_requestAccounts" });
    return result as string[];
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Send async - EIP-1193 legacy
   */
  async sendAsync(
    payload: JsonRpcRequest,
    callback: (error: Error | null, response: JsonRpcResponse) => void,
  ): Promise<void> {
    try {
      const result = await this.request({
        method: payload.method,
        params: payload.params,
      });
      callback(null, {
        id: payload.id ?? 1,
        jsonrpc: "2.0",
        result,
      });
    } catch (error) {
      callback(error as Error, {
        id: payload.id ?? 1,
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Send - EIP-1193 legacy
   */
  async send(
    methodOrPayload: string | JsonRpcRequest,
    paramsOrCallback?: unknown[] | ((error: Error | null, response: JsonRpcResponse) => void),
  ): Promise<JsonRpcResponse | unknown> {
    if (typeof methodOrPayload === "string") {
      return this.request({
        method: methodOrPayload,
        params: paramsOrCallback as unknown[],
      });
    }

    if (typeof paramsOrCallback === "function") {
      return this.sendAsync(methodOrPayload, paramsOrCallback);
    }

    return this.request({
      method: methodOrPayload.method,
      params: methodOrPayload.params,
    });
  }

  // EventEmitter compatibility
  on(event: string, listener: (...args: unknown[]) => void): void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(listener);
  }

  off(event: string, listener: (...args: unknown[]) => void): void {
    this._listeners.get(event)?.delete(listener);
  }

  emit(event: string, ...args: unknown[]): void {
    this._emit(event, ...args);
  }

  removeListener(event: string, listener: (...args: unknown[]) => void): void {
    this.off(event, listener);
  }

  addListener(event: string, listener: (...args: unknown[]) => void): void {
    this.on(event, listener);
  }

  once(event: string, listener: (...args: unknown[]) => void): void {
    const wrapper = (...args: unknown[]) => {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
  }

  listenerCount(event?: string): number {
    if (event) {
      return this._listeners.get(event)?.size ?? 0;
    }
    let count = 0;
    this._listeners.forEach((listeners) => {
      count += listeners.size;
    });
    return count;
  }

  listeners(event: string): Array<(...args: unknown[]) => void> {
    return Array.from(this._listeners.get(event) ?? []);
  }
}
