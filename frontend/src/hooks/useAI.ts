import { useState, useCallback } from 'react';
import { OllamaService } from '../services/OllamaService';

interface AIAnalysisState {
  isAnalyzing: boolean;
  result: {
    riskScore: number;
    recommendation: string;
    details: string[];
  } | null;
  error: string | null;
}

const initialState: AIAnalysisState = {
  isAnalyzing: false,
  result: null,
  error: null,
};

export const useAI = () => {
  const [state, setState] = useState<AIAnalysisState>(initialState);
  const ollamaService = new OllamaService();

  const analyzeRisk = useCallback(async (data: {
    income: number;
    expenses: number;
    creditScore: number;
    loanAmount: number;
    loanTerm: number;
  }) => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const analysis = await ollamaService.analyzeRisk(data);

      setState({
        isAnalyzing: false,
        result: analysis,
        error: null,
      });

      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na análise de risco';
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const detectFraud = useCallback(async (address: string): Promise<boolean> => {
    try {
      const result = await ollamaService.detectFraud(address);
      return result.isFraudulent;
    } catch (error) {
      console.error('Erro na detecção de fraude:', error);
      throw error;
    }
  }, []);

  const monitorPayment = useCallback(async (address: string): Promise<boolean> => {
    try {
      const result = await ollamaService.monitorPayment(address);
      return result.isPaymentOnTime;
    } catch (error) {
      console.error('Erro no monitoramento de pagamento:', error);
      throw error;
    }
  }, []);

  return {
    ...state,
    analyzeRisk,
    reset,
    detectFraud,
    monitorPayment
  };
}; 