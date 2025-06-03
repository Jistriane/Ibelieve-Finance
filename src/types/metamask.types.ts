export interface Transaction {
  from: string;
  to: string;
  value: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
  nonce?: number;
}

export interface TransactionHistory {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface GasPrice {
  slow: string;
  standard: string;
  fast: string;
}

export interface WalletBalance {
  balance: string;
  symbol: string;
  decimals: number;
}

export interface MetaMaskError {
  code: number;
  message: string;
  data?: any;
}
