/**
 * viem-inpage - EIP-1193 provider interface backed by viem client
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

export { createInpageClient, createInpageProvider, InpageProvider } from "./inpage.js";

export type {
  CreateProviderOptions,
  EthRpcSchema,
  InpageEvents,
  InpageOptions,
  InpagePushSchema,
  InpageSchema,
  JsonRpcError,
  JsonRpcRequest,
  JsonRpcResponse,
  ProviderInfo,
} from "./types.js";
