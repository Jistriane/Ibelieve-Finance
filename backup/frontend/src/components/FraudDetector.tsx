import React, { useState } from 'react';
import { aiService, FraudDetection } from '../services/aiService';

export const FraudDetector: React.FC = () => {
  const [transaction, setTransaction] = useState({
    amount: '',
    type: '',
    frequency: '',
    location: '',
    time: '',
    userHistory: ''
  });
  const [detection, setDetection] = useState<FraudDetection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.detectFraud(transaction);
      setDetection(result);
    } catch (err) {
      setError('Erro ao detectar fraude. Tente novamente.');
      console.error('Erro na detecção:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransaction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl animate-fadeIn">
        <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-center">
          IA Financeira Ibelieve Finance
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm transition-transform hover:scale-102">
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Valor da Transação
              </label>
              <input
                type="number"
                name="amount"
                value={transaction.amount}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm transition-transform hover:scale-102">
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Tipo de Transação
              </label>
              <select
                name="type"
                value={transaction.type}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                required
              >
                <option value="">Selecione...</option>
                <option value="transfer">Transferência</option>
                <option value="payment">Pagamento</option>
                <option value="withdrawal">Saque</option>
                <option value="deposit">Depósito</option>
              </select>
            </div>

            <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm transition-transform hover:scale-102">
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Frequência de Transações
              </label>
              <select
                name="frequency"
                value={transaction.frequency}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                required
              >
                <option value="">Selecione...</option>
                <option value="first">Primeira vez</option>
                <option value="rare">Rara</option>
                <option value="regular">Regular</option>
                <option value="frequent">Frequente</option>
              </select>
            </div>

            <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm transition-transform hover:scale-102">
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Localização
              </label>
              <input
                type="text"
                name="location"
                value={transaction.location}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                placeholder="País/Região"
                required
              />
            </div>

            <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm transition-transform hover:scale-102">
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Horário da Transação
              </label>
              <input
                type="datetime-local"
                name="time"
                value={transaction.time}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm transition-transform hover:scale-102">
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Histórico do Usuário
              </label>
              <select
                name="userHistory"
                value={transaction.userHistory}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                required
              >
                <option value="">Selecione...</option>
                <option value="new">Novo usuário</option>
                <option value="regular">Usuário regular</option>
                <option value="vip">Usuário VIP</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Analisando...
              </div>
            ) : (
              'Detectar Fraude'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-500/20 backdrop-blur-sm text-red-200 rounded-xl border border-red-500/30 animate-fadeIn">
            {error}
          </div>
        )}

        {detection && (
          <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-cyan-500/30 animate-fadeIn">
            <h3 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Resultado da Análise
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-cyan-300">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  detection.isFraudulent 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                    : 'bg-green-500/20 text-green-300 border border-green-500/30'
                }`}>
                  {detection.isFraudulent ? 'Potencial Fraude Detectada' : 'Transação Segura'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-cyan-300">Confiança:</span>
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${detection.confidence}%` }}
                  ></div>
                </div>
                <span className="text-white">{detection.confidence}%</span>
              </div>
              <div>
                <span className="font-medium text-cyan-300 block mb-2">Detalhes:</span>
                <ul className="space-y-2">
                  {detection.details.map((detail, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-2 text-white/80 animate-fadeIn"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 