/**
 * Types for viem-inpage
 */

import type { PortalSchema } from "viem-portal";

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
 * Inpage events
 */
export interface InpageEvents {
  accountsChanged: (accounts: string[]) => void;
  chainChanged: (chainId: string) => void;
  connect: (info: { chainId: string }) => void;
  disconnect: () => void;
  message: (message: { type: string; data: unknown }) => void;
}

/**
 * Standard Ethereum RPC methods schema
 */
export interface EthRpcSchema {
  eth_request: {
    params: [method: string, params?: unknown[]];
    result: unknown;
  };
}

/**
 * Default push events schema
 */
export interface InpagePushSchema {
  accountsChanged: {
    params: [accounts: string[]];
    result: void;
  };
  chainChanged: {
    params: [chainId: string];
    result: void;
  };
  connect: {
    params: [info: { chainId: string }];
    result: void;
  };
  disconnect: {
    params: [];
    result: void;
  };
  message: {
    params: [message: { type: string; data: unknown }];
    result: void;
  };
}

/**
 * Full schema combining RPC and push events
 */
export type InpageSchema = PortalSchema & EthRpcSchema & InpagePushSchema;

/**
 * InpageProvider options
 */
export interface InpageOptions<TSchema extends PortalSchema = PortalSchema> {
  /** Custom method handlers */
  handlers?: TSchema;

  /** Chain configuration */
  chain?: {
    id: number;
    name?: string;
  };
}

/**
 * Provider detection info for EIP-6963
 */
export interface ProviderInfo {
  icon: string;
  name: string;
  rdns: string;
  uuid: string;
}

/**
 * Create provider options
 */
export interface CreateProviderOptions {
  /** Provider name */
  name?: string;

  /** Provider icon (base64 or URL) */
  icon?: string;

  /** Reverse domain identifier */
  rdns?: string;

  /** Unique identifier */
  uuid?: string;
}
