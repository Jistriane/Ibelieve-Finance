import React, { useState } from 'react';
import { aiService, ZKPRecommendation } from '../services/aiService';

export const ZKPOptimizer: React.FC = () => {
  const [userProfile, setUserProfile] = useState({
    transactionSize: '',
    frequency: '',
    complexity: '',
    privacyLevel: ''
  });
  const [recommendation, setRecommendation] = useState<ZKPRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.optimizeZKP(userProfile);
      setRecommendation(result);
    } catch (err) {
      setError('Erro ao otimizar prova ZKP. Tente novamente.');
      console.error('Erro na otimização:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Otimizador de Provas ZKP</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tamanho da Transação
          </label>
          <select
            name="transactionSize"
            value={userProfile.transactionSize}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Selecione...</option>
            <option value="small">Pequena</option>
            <option value="medium">Média</option>
            <option value="large">Grande</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Frequência de Uso
          </label>
          <select
            name="frequency"
            value={userProfile.frequency}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Selecione...</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Complexidade da Prova
          </label>
          <select
            name="complexity"
            value={userProfile.complexity}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Selecione...</option>
            <option value="simple">Simples</option>
            <option value="moderate">Moderada</option>
            <option value="complex">Complexa</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nível de Privacidade Necessário
          </label>
          <select
            name="privacyLevel"
            value={userProfile.privacyLevel}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Selecione...</option>
            <option value="basic">Básico</option>
            <option value="standard">Padrão</option>
            <option value="high">Alto</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Otimizando...' : 'Otimizar Prova ZKP'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {recommendation && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Recomendação de Prova ZKP</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Tipo de Prova:</span>{' '}
              {recommendation.proofType}
            </p>
            <p>
              <span className="font-medium">Eficiência:</span>{' '}
              {recommendation.efficiency}%
            </p>
            <p>
              <span className="font-medium">Explicação:</span>{' '}
              {recommendation.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 