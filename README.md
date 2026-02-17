# viem-inpage

EIP-1193 provider interface backed by viem client with viem-portal integration.

## Installation

```bash
npm install viem-inpage
# or
bun add viem-inpage
```

## Usage

```ts
import { createInpageProvider, createInpageClient } from 'viem-inpage';

// Create a client for window communication
const client = createInpageClient();

// Create the EIP-1193 provider
const provider = createInpageProvider(client);

// Use as window.ethereum
const accounts = await provider.request({ method: 'eth_requestAccounts' });
console.log(accounts);

// Listen for events
provider.on('accountsChanged', (accounts) => {
  console.log('Accounts changed:', accounts);
});

provider.on('chainChanged', (chainId) => {
  console.log('Chain changed:', chainId);
});
```

## Features

- ✅ EIP-1193 compliant provider
- ✅ Full event emission (accountsChanged, chainChanged, connect, disconnect)
- ✅ Legacy methods (send, sendAsync, enable, isConnected)
- ✅ Built on viem-portal for typed messaging
- ✅ TypeScript support
- ✅ Minimal bundle size

## API

### createInpageClient(options?)

Creates a viem-portal client configured for inpage (window) communication.

### createInpageProvider(client)

Creates an InpageProvider instance from a viem-portal client.

### InpageProvider

The main provider class implementing EIP-1193.

#### Methods

- `request(args)` - EIP-1193 standard request method
- `enable()` - Legacy method, use request('eth_requestAccounts')
- `isConnected()` - Check if connected
- `send(method, params)` - Legacy send method
- `sendAsync(payload, callback)` - Legacy async send
- `on(event, listener)` - Add event listener
- `off(event, listener)` - Remove event listener
- `emit(event, ...args)` - Emit event
- `once(event, listener)` - Add one-time listener

#### Properties

- `chainId` - Current chain ID
- `connected` - Whether connected
- `isRainbow` - Always true
- `isReady` - Always true
- `isMetaMask` - MetaMask compatibility flag
- `networkVersion` - Network version
- `selectedAddress` - Selected address

## Related

- [viem](https://viem.sh) - Ethereum JSON-RPC client
- [viem-portal](https://github.com/jarvis-boop/viem-portal) - Typed portal messaging
- [viem-hw](https://github.com/jarvis-boop/viem-hw) - Hardware wallet SDK

## License

MIT
