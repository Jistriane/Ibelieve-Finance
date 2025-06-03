import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ZKPVerification from '../ZKPVerification';
import { ProofStatus } from '../../types/zkp';

describe('ZKPVerification', () => {
  const mockOnGenerateProof = jest.fn();
  const mockOnVerifyProof = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o componente corretamente', () => {
    render(
      <ZKPVerification
        onGenerateProof={mockOnGenerateProof}
        onVerifyProof={mockOnVerifyProof}
        status="idle"
      />
    );

    expect(screen.getByText('Verificação ZKP')).toBeInTheDocument();
    expect(screen.getByText('Gerar Prova')).toBeInTheDocument();
  });

  it('deve chamar onGenerateProof quando o botão é clicado', async () => {
    render(
      <ZKPVerification
        onGenerateProof={mockOnGenerateProof}
        onVerifyProof={mockOnVerifyProof}
        status="idle"
      />
    );

    fireEvent.click(screen.getByText('Gerar Prova'));
    await waitFor(() => {
      expect(mockOnGenerateProof).toHaveBeenCalled();
    });
  });

  it('deve mostrar loading durante a geração da prova', async () => {
    render(
      <ZKPVerification
        onGenerateProof={mockOnGenerateProof}
        onVerifyProof={mockOnVerifyProof}
        status="generating"
      />
    );

    expect(screen.getByText('Gerando Prova...')).toBeInTheDocument();
  });

  it('deve mostrar botão de verificar quando a prova é gerada', () => {
    render(
      <ZKPVerification
        onGenerateProof={mockOnGenerateProof}
        onVerifyProof={mockOnVerifyProof}
        status="generated"
      />
    );

    expect(screen.getByText('Verificar Prova')).toBeInTheDocument();
    expect(screen.getByText(/Prova gerada com sucesso!/)).toBeInTheDocument();
  });

  it('deve chamar onVerifyProof quando o botão de verificar é clicado', async () => {
    render(
      <ZKPVerification
        onGenerateProof={mockOnGenerateProof}
        onVerifyProof={mockOnVerifyProof}
        status="generated"
      />
    );

    fireEvent.click(screen.getByText('Verificar Prova'));
    await waitFor(() => {
      expect(mockOnVerifyProof).toHaveBeenCalled();
    });
  });

  it('deve mostrar loading durante a verificação', () => {
    render(
      <ZKPVerification
        onGenerateProof={mockOnGenerateProof}
        onVerifyProof={mockOnVerifyProof}
        status="verifying"
      />
    );

    expect(screen.getByText('Verificando...')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de sucesso quando verificado', () => {
    render(
      <ZKPVerification
        onGenerateProof={mockOnGenerateProof}
        onVerifyProof={mockOnVerifyProof}
        status="verified"
      />
    );

    expect(screen.getByText(/Prova verificada com sucesso!/)).toBeInTheDocument();
  });

  it('deve mostrar mensagem de erro quando ocorre um erro', () => {
    render(
      <ZKPVerification
        onGenerateProof={mockOnGenerateProof}
        onVerifyProof={mockOnVerifyProof}
        status="error"
      />
    );

    expect(screen.getByText(/Ocorreu um erro durante o processo/)).toBeInTheDocument();
  });

  it('deve desabilitar botões apropriadamente baseado no status', () => {
    const { rerender } = render(
      <ZKPVerification
        onGenerateProof={mockOnGenerateProof}
        onVerifyProof={mockOnVerifyProof}
        status="generating"
      />
    );

    expect(screen.getByText('Gerando Prova...')).toBeDisabled();

    rerender(
      <ZKPVerification
        onGenerateProof={mockOnGenerateProof}
        onVerifyProof={mockOnVerifyProof}
        status="verifying"
      />
    );

    expect(screen.getByText('Verificando...')).toBeDisabled();
  });
}); 