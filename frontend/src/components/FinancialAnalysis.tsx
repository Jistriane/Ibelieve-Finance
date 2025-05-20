import React, { useState } from 'react';
import { ollamaService } from '../services/ollamaService';
import './FinancialAnalysis.css';

interface AnalysisResult {
  analysis: string;
  recommendation: string;
  riskLevel: 'BAIXO' | 'MÉDIO' | 'ALTO';
  confidence: number;
}

interface FinancialAnalysisProps {
  requestedAmount: number;
  netWorth: number;
  historicalData?: any[];
  riskFactors?: any[];
}

export function FinancialAnalysis({
  requestedAmount,
  netWorth,
  historicalData,
  riskFactors
}: FinancialAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ollamaService.analyzeFinancialData({
        requestedAmount,
        netWorth,
        historicalData,
        riskFactors
      });
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar análise');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'BAIXO':
        return '#2CB67D';
      case 'MÉDIO':
        return '#FFB800';
      case 'ALTO':
        return '#FF4D4D';
      default:
        return '#ccc';
    }
  };

  return (
    <div className="financial-analysis">
      <h2>Análise Financeira Inteligente</h2>
      
      <div className="analysis-controls">
        <button 
          onClick={analyzeData}
          disabled={loading}
          className="analyze-button"
        >
          {loading ? 'Analisando...' : 'Realizar Análise'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {analysis && (
        <div className="analysis-result">
          <div className="analysis-section">
            <h3>Análise Detalhada</h3>
            <p>{analysis.analysis}</p>
          </div>

          <div className="analysis-section">
            <h3>Recomendação</h3>
            <p>{analysis.recommendation}</p>
          </div>

          <div className="analysis-metrics">
            <div className="metric">
              <h4>Nível de Risco</h4>
              <span style={{ color: getRiskLevelColor(analysis.riskLevel) }}>
                {analysis.riskLevel}
              </span>
            </div>

            <div className="metric">
              <h4>Confiança da Análise</h4>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ width: `${analysis.confidence}%` }}
                />
                <span>{analysis.confidence}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialAnalysis; 