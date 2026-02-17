/**
 * viem-inpage - EIP-1193 provider interface backed by viem client
 *
 * Provides a simple EIP-1193 provider that forwards requests to a viem client.
 * Built for browser extension environments with viem-portal integration.
 */

import type { PortalClient, PortalSchema } from "viem-portal";

import type { InpageOptions, JsonRpcRequest, JsonRpcResponse } from "./types.js";

export { type InpageOptions, type JsonRpcRequest, type JsonRpcResponse } from "./types.js";

/**
 * Create a viem client configured for inpage (window) communication
 */
export function createInpageClient<TSchema extends PortalSchema = PortalSchema>(
  options?: InpageOptions<TSchema>,
): PortalClient<TSchema> {
  const { createWindowTransport, createClient } = require("viem-portal");
  const transport = createWindowTransport();
  return createClient(transport, { handlers: options?.handlers as never });
}

/**
 * InpageProvider - EIP-1193 compatible provider
 *
 * Wraps a viem-portal client to provide a standard EIP-1193 interface.
 * Supports both standard Ethereum methods and custom messages.
 *
 * @example
 * ```ts
 * import { createInpageProvider, createInpageClient } from 'viem-inpage';
 *
 * const client = createInpageClient();
 * const provider = createInpageProvider(client);
 *
 * // Use as window.ethereum
 * const accounts = await provider.request({ method: 'eth_requestAccounts' });
 * ```
 */
export class InpageProvider {
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

  /** Selected address */
  selectedAddress?: string;

  private client: PortalClient<PortalSchema>;
  private _isConnected = false;
  private _listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  constructor(client: PortalClient<PortalSchema>) {
    this.client = client;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Subscribe to push events from background
    this.client.subscribe("accountsChanged", (data: unknown) => {
      const accounts = data as string[];
      this.selectedAddress = accounts[0];
      this._isConnected = accounts.length > 0;
      this._emit("accountsChanged", accounts);
    });

    this.client.subscribe("chainChanged", (data: unknown) => {
      const chainId = data as string;
      this.chainId = chainId;
      this.networkVersion = parseInt(chainId, 16).toString();
      this._emit("chainChanged", chainId);
    });

    this.client.subscribe("disconnect", () => {
      this.selectedAddress = undefined;
      this._isConnected = false;
      this._emit("accountsChanged", []);
      this._emit("disconnect", []);
    });

    this.client.subscribe("connect", (data: unknown) => {
      this._isConnected = true;
      this._emit("connect", data);
    });
  }

  private _emit(event: string, ...args: unknown[]): void {
    this._listeners.get(event)?.forEach((listener) => listener(...args));
  }

  /**
   * Request method - EIP-1193 standard
   */
  async request(args: { method: string; params?: unknown[] }): Promise<unknown> {
    const { method, params } = args;

    const result = await this.client.request("eth_request", method, params);

    // Update internal state for certain methods
    if (method === "eth_requestAccounts" && Array.isArray(result)) {
      this.selectedAddress = result[0] as string | undefined;
      this._isConnected = true;
      this.connected = true;
    } else if (method === "eth_chainId" && typeof result === "string") {
      this.chainId = result;
      this.networkVersion = parseInt(result, 16).toString();
    }

    return result;
  }

  /**
   * Enable - legacy method, use request({ method: 'eth_requestAccounts' })
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

    // If second arg is callback, use sendAsync
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

/**
 * Create an InpageProvider from a viem-portal client
 */
export function createInpageProvider(client: PortalClient<PortalSchema>): InpageProvider {
  return new InpageProvider(client);
}
