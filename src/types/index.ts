export interface RequestArguments {
  method: string;
  params?: unknown[];
}

export type EventCallback = (params: unknown) => void;

export interface EthereumProvider {
  isMetaMask?: boolean;
  isSubWallet?: boolean;
  request: (args: RequestArguments) => Promise<unknown>;
  on: (eventName: string, handler: EventCallback) => void;
  removeListener: (eventName: string, handler: EventCallback) => void;
  selectedAddress: string | null;
  networkVersion: string;
  chainId: string;
  isConnected: () => boolean;
}

declare global {
  interface Window {
    ethereum: EthereumProvider | undefined;
    subwallet: EthereumProvider | undefined;
  }
}

export interface LoanRequest {
  amount: string;
  term: string;
  purpose: string;
}

export interface Transaction {
  id: number;
  date: string;
  amount: string;
  status: string;
  type: string;
}

export interface Settings {
  notifications: boolean;
  darkMode: boolean;
  autoConnect: boolean;
}

export interface ZKProof {
  hash: string;
  timestamp: number;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  confidence: number;
}

export interface RiskAnalysis {
  score: number;
  recommendations: string[];
  details: {
    creditHistory: number;
    collateral: number;
    transactionHistory: number;
  };
}

export interface AIResponse {
  response: string;
  confidence: number;
  details?: any;
} 