export interface ZKPResponse {
  success: boolean;
  proof?: string;
  error?: string;
}

export interface BlockchainResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface RiskResponse {
  success: boolean;
  risk: 'baixo' | 'alto';
  score?: number;
  factors?: {
    transactionHistory: number;
    balance: number;
    activity: number;
  };
  recommendation?: string;
  error?: string;
}

export interface LoanRequest {
  walletAddress: string;
  amount: string;
  term: string;
}

export interface LoanResponse {
  success: boolean;
  loanId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  error?: string;
} 