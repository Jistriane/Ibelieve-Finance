export interface ZKPStatus {
  isGenerating: boolean;
  isVerifying: boolean;
  proofGenerated: boolean;
  isVerified: boolean;
  error?: string;
  transactionHash?: string;
}

export type ProofStatus = 'idle' | 'generating' | 'generated' | 'verifying' | 'verified' | 'error'; 