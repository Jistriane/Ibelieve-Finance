export interface RiskResult {
  score: number;
  approved: boolean;
  reason?: string;
  interestRate: number;
  recommendations?: string[];
} 