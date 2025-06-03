export interface ITokenPayload {
  id: string;
  email: string;
  role: string;
  walletAddress: string;
  iat?: number;
  exp?: number;
}

export interface IUser {
  id: string;
  email: string;
  password: string;
  role: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction {
  id: string;
  userId: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description: string;
  category: string;
  date: Date;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  riskScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalysis {
  id: string;
  transactionId: string;
  userId: string;
  riskScore: number;
  fraudProbability: number;
  recommendations: string[];
  indicators: string[];
  analysisDetails: IAnalysisDetail[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalysisDetail {
  category: string;
  description: string;
  score: number;
}

export interface IFeedback {
  id: string;
  analysisId: string;
  transactionId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
} 