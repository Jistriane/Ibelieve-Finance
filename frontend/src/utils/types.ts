export type WalletType = 'metamask' | 'subwallet';

export interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  network: string;
}

export interface ZKProof {
  proof: any;
  publicInputs: any;
  publicOutput: any;
}

export interface RiskAnalysis {
  approved: boolean;
  riskScore: number;
  reason: string;
}

export interface FraudDetection {
  isFraudulent: boolean;
  confidence: number;
  reason: string;
}

export interface PaymentMonitoring {
  isPaymentOnTime: boolean;
  daysLate: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Transaction {
  from: string;
  to: string;
  value: string;
  gas: string;
  hash: string;
  timestamp: number;
}

export interface ProofRegistration {
  proofHash: string;
  timestamp: number;
  verifier: string;
}

export interface LoanRequest {
  address: string;
  amount: number;
  proof: ZKProof;
  riskAnalysis: RiskAnalysis;
}

export interface LoanStatus {
  requestId: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  reason?: string;
} 