import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WalletConnect from '../WalletConnect';
import { WalletInfo } from '../../types/wallet';

describe('WalletConnect', () => {
  const mockWallet: WalletInfo = {
    address: '0x1234567890123456789012345678901234567890',
    balance: '1.5',
    chainId: 1,
    network: 'mainnet',
  };

  it('deve renderizar o botão de conectar quando não há carteira', () => {
    render(
      <WalletConnect
        onConnect={jest.fn()}
        onDisconnect={jest.fn()}
        wallet={null}
      />
    );

    expect(screen.getByText('Conectar Carteira')).toBeInTheDocument();
  });

  it('deve chamar onConnect quando o botão é clicado', async () => {
    const onConnect = jest.fn();
    render(
      <WalletConnect
        onConnect={onConnect}
        onDisconnect={jest.fn()}
        wallet={null}
      />
    );

    fireEvent.click(screen.getByText('Conectar Carteira'));
    await waitFor(() => {
      expect(onConnect).toHaveBeenCalled();
    });
  });

  it('deve mostrar informações da carteira quando conectada', () => {
    render(
      <WalletConnect
        onConnect={jest.fn()}
        onDisconnect={jest.fn()}
        wallet={mockWallet}
      />
    );

    expect(screen.getByText(/Carteira Conectada:/)).toBeInTheDocument();
    expect(screen.getByText(/Saldo: 1.5 ETH/)).toBeInTheDocument();
    expect(screen.getByText('Desconectar')).toBeInTheDocument();
  });

  it('deve chamar onDisconnect quando o botão de desconectar é clicado', () => {
    const onDisconnect = jest.fn();
    render(
      <WalletConnect
        onConnect={jest.fn()}
        onDisconnect={onDisconnect}
        wallet={mockWallet}
      />
    );

    fireEvent.click(screen.getByText('Desconectar'));
    expect(onDisconnect).toHaveBeenCalled();
  });

  it('deve mostrar loading durante a conexão', async () => {
    const onConnect = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(
      <WalletConnect
        onConnect={onConnect}
        onDisconnect={jest.fn()}
        wallet={null}
      />
    );

    fireEvent.click(screen.getByText('Conectar Carteira'));
    expect(screen.getByText('Conectando...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Conectando...')).not.toBeInTheDocument();
    });
  });
}); 