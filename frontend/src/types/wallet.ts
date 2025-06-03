export interface Wallet {
  address: string;
  balance: string;
  type: 'metamask' | 'subwallet';
}

export interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  network: string;
}

export type WalletType = 'metamask' | 'subwallet';

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  provider: any | null;
  error: string | null;
}

export interface WalletConnectProps {
  onConnect?: (walletType: WalletType) => void;
  onDisconnect?: () => void;
  wallet?: WalletType;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
    subwallet?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isSubWallet?: boolean;
    };
  }
} 