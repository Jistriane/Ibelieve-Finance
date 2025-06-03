import React from 'react';
import { render, screen } from '@testing-library/react';
import RiskAnalysis from '../RiskAnalysis';
import { RiskResult } from '../../types/risk';

describe('RiskAnalysis', () => {
  const mockResult: RiskResult = {
    score: 75,
    approved: true,
    interestRate: 5.5,
    recommendations: [
      'Mantenha um bom histórico de pagamentos',
      'Considere aumentar seu saldo em carteira',
    ],
  };

  it('deve renderizar a análise de risco corretamente', () => {
    render(
      <RiskAnalysis
        result={mockResult}
        loanAmount="1.5"
        walletBalance="2.0"
      />
    );

    expect(screen.getByText('Análise de Risco')).toBeInTheDocument();
    expect(screen.getByText('Pontuação de Crédito')).toBeInTheDocument();
    expect(screen.getByText('Detalhes do Empréstimo')).toBeInTheDocument();
  });

  it('deve mostrar a pontuação de crédito', () => {
    render(
      <RiskAnalysis
        result={mockResult}
        loanAmount="1.5"
        walletBalance="2.0"
      />
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('deve mostrar os detalhes do empréstimo', () => {
    render(
      <RiskAnalysis
        result={mockResult}
        loanAmount="1.5"
        walletBalance="2.0"
      />
    );

    expect(screen.getByText('Valor Solicitado: 1.5 ETH')).toBeInTheDocument();
    expect(screen.getByText('Saldo da Carteira: 2.0 ETH')).toBeInTheDocument();
    expect(screen.getByText('Taxa de Juros: 5.5% ao ano')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de aprovação quando aprovado', () => {
    render(
      <RiskAnalysis
        result={mockResult}
        loanAmount="1.5"
        walletBalance="2.0"
      />
    );

    expect(screen.getByText(/Empréstimo aprovado!/)).toBeInTheDocument();
  });

  it('deve mostrar mensagem de rejeição quando não aprovado', () => {
    const rejectedResult: RiskResult = {
      ...mockResult,
      approved: false,
      reason: 'Pontuação de crédito insuficiente',
    };

    render(
      <RiskAnalysis
        result={rejectedResult}
        loanAmount="1.5"
        walletBalance="2.0"
      />
    );

    expect(screen.getByText(/Empréstimo não aprovado/)).toBeInTheDocument();
    expect(screen.getByText(/Pontuação de crédito insuficiente/)).toBeInTheDocument();
  });

  it('deve mostrar recomendações quando disponíveis', () => {
    render(
      <RiskAnalysis
        result={mockResult}
        loanAmount="1.5"
        walletBalance="2.0"
      />
    );

    expect(screen.getByText('Recomendações')).toBeInTheDocument();
    expect(screen.getByText('Mantenha um bom histórico de pagamentos')).toBeInTheDocument();
    expect(screen.getByText('Considere aumentar seu saldo em carteira')).toBeInTheDocument();
  });
}); 