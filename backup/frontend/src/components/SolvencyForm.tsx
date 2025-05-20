import React, { useState } from 'react';
import { generateFinancingProof } from '../services/solvency';
import { connectWallet } from '../services/wallet';
import { FinancialAnalysis } from './FinancialAnalysis';
import './SolvencyForm.css';

interface FinancingProof {
  isApproved: boolean;
  requestedAmount: number;
  netWorth: number;
  timestamp: number;
  proof: {
    pi_a: [string, string];
    pi_b: [[string, string], [string, string]];
    pi_c: [string, string];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
}

interface FormErrors {
  requestedAmount?: string;
  netWorth?: string;
}

export function SolvencyForm() {
  const [requestedAmount, setRequestedAmount] = useState<string>('');
  const [netWorth, setNetWorth] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proof, setProof] = useState<FinancingProof | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.id === 'requestedAmount') {
      setRequestedAmount(value);
    } else if (e.target.id === 'netWorth') {
      setNetWorth(value);
    }
    if (errors[e.target.id as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [e.target.id as keyof FormErrors]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const amount = parseFloat(requestedAmount);
      const worth = parseFloat(netWorth);

      if (isNaN(amount) || isNaN(worth)) {
        throw new Error('Por favor, insira valores numéricos válidos');
      }

      const generatedProof = await generateFinancingProof({
        requestedAmount: amount,
        netWorth: worth
      });
      setProof(generatedProof);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar prova');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="solvency-form-container">
      <form onSubmit={handleSubmit} className="solvency-form">
        <h2>Prova de Solvência</h2>
        
        <div className="form-group">
          <label htmlFor="requestedAmount">Valor Solicitado (tVFY)</label>
          <input
            type="number"
            id="requestedAmount"
            value={requestedAmount}
            onChange={handleInputChange}
            placeholder="Digite o valor solicitado"
            required
          />
          {errors.requestedAmount && (
            <p className="error-message">{errors.requestedAmount}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="netWorth">Patrimônio Líquido (tVFY)</label>
          <input
            type="number"
            id="netWorth"
            value={netWorth}
            onChange={handleInputChange}
            placeholder="Digite seu patrimônio líquido"
            required
          />
          {errors.netWorth && (
            <p className="error-message">{errors.netWorth}</p>
          )}
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Gerando Prova...' : 'Gerar Prova de Solvência'}
        </button>

        {error && <div className="error-message">{error}</div>}
      </form>

      {proof && (
        <FinancialAnalysis
          requestedAmount={proof.requestedAmount}
          netWorth={proof.netWorth}
          historicalData={[
            {
              timestamp: proof.timestamp,
              amount: proof.requestedAmount,
              worth: proof.netWorth
            }
          ]}
          riskFactors={[
            {
              type: 'SOLVENCY_RATIO',
              value: proof.netWorth / proof.requestedAmount
            }
          ]}
        />
      )}
    </div>
  );
}

export default SolvencyForm; 