declare interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
    request?: (...args: any[]) => Promise<any>;
    send?: (...args: any[]) => Promise<any>;
    selectedAddress?: string;
    networkVersion?: string;
    chainId?: string;
    _metamask?: {
      isUnlocked?: () => Promise<boolean>;
    };
  };
}

export interface EthereumProvider {
  isMetaMask?: boolean;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  send: (method: string, params: any[]) => Promise<any>;
  selectedAddress?: string;
  networkVersion?: string;
  chainId?: string;
  _metamask?: {
    isUnlocked: () => Promise<boolean>;
  };
}

export interface EthereumEvent {
  connect: {
    chainId: string;
  };
  disconnect: undefined;
  accountsChanged: string[];
  chainChanged: string;
  message: {
    type: string;
    data: unknown;
  };
}

export interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
  message: string;
}
