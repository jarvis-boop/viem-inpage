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

export { createEip1193Provider, Eip1193Provider } from "./inpage.js";

export type {
  CustomMethods,
  Eip1193ProviderOptions,
  JsonRpcError,
  JsonRpcRequest,
  JsonRpcResponse,
} from "./types.js";
