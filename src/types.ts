/**
 * Types for viem-inpage
 */

/**
 * JSON-RPC request
 */
export interface JsonRpcRequest {
  id?: number | string;
  jsonrpc?: string;
  method: string;
  params?: unknown[];
}

/**
 * JSON-RPC response
 */
export interface JsonRpcResponse {
  id: number | string;
  jsonrpc: string;
  result?: unknown;
  error?: JsonRpcError;
}

/**
 * JSON-RPC error
 */
export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * Custom method handlers
 */
export interface CustomMethods {
  [key: string]: (params: unknown[]) => Promise<unknown>;
}

/**
 * Options for createEip1193Provider
 */
export interface Eip1193ProviderOptions {
  /** Custom method handlers */
  custom?: CustomMethods;

  /** Whether this is Rainbow */
  isRainbow?: boolean;

  /** Whether this is MetaMask-compatible */
  isMetaMask?: boolean;
}
