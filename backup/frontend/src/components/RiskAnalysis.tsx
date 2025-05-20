import React, { useState } from 'react';
import { aiService, RiskAnalysis } from '../services/aiService';

export const RiskAnalysisComponent: React.FC = () => {
  const [financialData, setFinancialData] = useState({
    income: '',
    expenses: '',
    creditScore: '',
    debtLevel: ''
  });
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.analyzeRisk(financialData);
      setAnalysis(result);
    } catch (err) {
      setError('Erro ao realizar análise de risco. Tente novamente.');
      console.error('Erro na análise:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFinancialData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Análise de Risco Financeiro</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Renda Mensal
          </label>
          <input
            type="number"
            name="income"
            value={financialData.income}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Despesas Mensais
          </label>
          <input
            type="number"
            name="expenses"
            value={financialData.expenses}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Score de Crédito
          </label>
          <input
            type="number"
            name="creditScore"
            value={financialData.creditScore}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nível de Dívida
          </label>
          <input
            type="number"
            name="debtLevel"
            value={financialData.debtLevel}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Analisando...' : 'Analisar Risco'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {analysis && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Resultado da Análise</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Score de Risco:</span>{' '}
              {analysis.riskScore}/100
            </p>
            <p>
              <span className="font-medium">Confiança:</span>{' '}
              {analysis.confidence}%
            </p>
            <div>
              <span className="font-medium">Recomendações:</span>
              <ul className="list-disc list-inside mt-1">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 