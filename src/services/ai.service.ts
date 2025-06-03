import axios from 'axios';
import { config } from '../config';

interface AIResponse {
  response: string;
  confidence: number;
  details?: any;
}

interface RiskAnalysis {
  score: number;
  recommendations: string[];
  details: {
    creditHistory: number;
    collateral: number;
    transactionHistory: number;
  };
}

interface FraudDetection {
  isFraudulent: boolean;
  confidence: number;
  details: string[];
}

class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.ai.baseUrl || 'http://localhost:11434/api';
  }

  async chat(message: string): Promise<AIResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat`, {
        model: 'gemma',
        messages: [{ role: 'user', content: message }],
      });
      return {
        response: response.data.message,
        confidence: response.data.confidence || 0.8,
      };
    } catch (error) {
      console.error('Erro ao comunicar com IA:', error);
      throw new Error('Falha na comunicação com a IA');
    }
  }

  async analyzeRisk(walletAddress: string, loanAmount: number): Promise<RiskAnalysis> {
    try {
      const response = await axios.post(`${this.baseUrl}/analyze`, {
        model: 'gemma',
        prompt: `Analise o risco para o endereço ${walletAddress} solicitando ${loanAmount} ETH`,
      });

      return {
        score: response.data.score,
        recommendations: response.data.recommendations,
        details: response.data.details,
      };
    } catch (error) {
      console.error('Erro na análise de risco:', error);
      throw new Error('Falha na análise de risco');
    }
  }

  async detectFraud(transaction: any): Promise<FraudDetection> {
    try {
      const response = await axios.post(`${this.baseUrl}/detect-fraud`, {
        model: 'gemma',
        transaction,
      });

      return {
        isFraudulent: response.data.isFraudulent,
        confidence: response.data.confidence,
        details: response.data.details,
      };
    } catch (error) {
      console.error('Erro na detecção de fraude:', error);
      throw new Error('Falha na detecção de fraude');
    }
  }

  async optimizeZKP(proofType: string): Promise<AIResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/optimize`, {
        model: 'gemma',
        proofType,
      });

      return {
        response: response.data.optimization,
        confidence: response.data.confidence,
        details: response.data.details,
      };
    } catch (error) {
      console.error('Erro na otimização ZKP:', error);
      throw new Error('Falha na otimização ZKP');
    }
  }
}

export const aiService = new AIService(); 