interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

interface Ethereum {
  isMetaMask?: boolean;
  request: (args: RequestArguments) => Promise<unknown>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
  selectedAddress: string | null;
  chainId: string | null;
}

declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

export {}; 