import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoanRequest from '../LoanRequest';

describe('LoanRequest', () => {
  it('deve renderizar o formulário corretamente', () => {
    render(<LoanRequest onRequest={jest.fn()} />);

    expect(screen.getByText('Solicitar Empréstimo')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor do Empréstimo (ETH)')).toBeInTheDocument();
    expect(screen.getByText('Solicitar Análise')).toBeInTheDocument();
  });

  it('deve validar valor mínimo', async () => {
    render(<LoanRequest onRequest={jest.fn()} />);

    const input = screen.getByLabelText('Valor do Empréstimo (ETH)');
    fireEvent.change(input, { target: { value: '0.05' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText('Valor mínimo: 0.1 ETH')).toBeInTheDocument();
    });
  });

  it('deve validar valor máximo', async () => {
    render(<LoanRequest onRequest={jest.fn()} />);

    const input = screen.getByLabelText('Valor do Empréstimo (ETH)');
    fireEvent.change(input, { target: { value: '11' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText('Valor máximo: 10 ETH')).toBeInTheDocument();
    });
  });

  it('deve validar formato do valor', async () => {
    render(<LoanRequest onRequest={jest.fn()} />);

    const input = screen.getByLabelText('Valor do Empréstimo (ETH)');
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText('Digite um valor válido')).toBeInTheDocument();
    });
  });

  it('deve chamar onRequest com valor válido', async () => {
    const onRequest = jest.fn();
    render(<LoanRequest onRequest={onRequest} />);

    const input = screen.getByLabelText('Valor do Empréstimo (ETH)');
    fireEvent.change(input, { target: { value: '1.5' } });
    fireEvent.click(screen.getByText('Solicitar Análise'));

    await waitFor(() => {
      expect(onRequest).toHaveBeenCalledWith('1.5');
    });
  });

  it('deve desabilitar o formulário quando disabled é true', () => {
    render(<LoanRequest onRequest={jest.fn()} disabled />);

    expect(screen.getByLabelText('Valor do Empréstimo (ETH)')).toBeDisabled();
    expect(screen.getByText('Solicitar Análise')).toBeDisabled();
  });
}); 