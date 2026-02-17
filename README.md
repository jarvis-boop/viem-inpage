# viem-inpage

EIP-1193 provider from viem client.

## Installation

```bash
npm install viem-inpage
# or
bun add viem-inpage
```

## Usage

```ts
import { createPublicClient, http } from 'viem';
import { createEip1193Provider } from 'viem-inpage';

const client = createPublicClient({ transport: http() });
const provider = createEip1193Provider(client);

// Use as window.ethereum
const accounts = await provider.request({ method: 'eth_requestAccounts' });
console.log(accounts);

// With custom methods
const providerWithCustom = createEip1193Provider(client, {
  custom: {
    wallet_action: async ([action, payload]) => {
      return { result: 'ok' };
    },
  },
});
```

## API

### createEip1193Provider(client, options?)

Creates an EIP-1193 provider from a viem client.

- `client` - A viem client (PublicClient, WalletClient, etc.)
- `options` - Optional configuration
  - `custom` - Custom method handlers
  - `isRainbow` - Whether this is Rainbow (default: true)
  - `isMetaMask` - MetaMask compatibility (default: true)

### Eip1193Provider

The main provider class implementing EIP-1193.

#### Methods

- `request(args)` - EIP-1193 standard request method
- `enable()` - Legacy method
- `isConnected()` - Check if connected
- `send(method, params)` - Legacy send method
- `sendAsync(payload, callback)` - Legacy async send
- `on(event, listener)` - Add event listener
- `off(event, listener)` - Remove event listener
- `emit(event, ...args)` - Emit event

## License

MIT
