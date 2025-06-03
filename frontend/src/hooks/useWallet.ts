import { useState, useEffect, useCallback } from 'react';
import { WalletType } from '../components/wallet/WalletConnect';
import { NotificationService } from '../services/NotificationService';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: string | null;
  provider: any | null;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    provider: null,
  });

  const connect = useCallback(async (walletType: WalletType) => {
    try {
      let provider;
      let accounts;
      let chainId;

      if (walletType === 'metamask') {
        if (!window.ethereum) {
          throw new Error('MetaMask não está instalado');
        }
        provider = window.ethereum;
      } else if (walletType === 'subwallet') {
        if (!window.subwallet) {
          throw new Error('SubWallet não está instalado');
        }
        provider = window.subwallet;
      } else {
        throw new Error('Carteira não suportada');
      }

      accounts = await provider.request({ method: 'eth_requestAccounts' });
      chainId = await provider.request({ method: 'eth_chainId' });

      setWalletState({
        address: accounts[0],
        isConnected: true,
        chainId,
        provider,
      });

      NotificationService.walletConnected(walletType);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      NotificationService.walletError(errorMessage);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletState({
      address: null,
      isConnected: false,
      chainId: null,
      provider: null,
    });
    NotificationService.walletDisconnected();
  }, []);

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setWalletState(prev => ({
          ...prev,
          address: accounts[0],
          isConnected: true,
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setWalletState(prev => ({
        ...prev,
        chainId,
      }));
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    if (window.subwallet) {
      window.subwallet.on('accountsChanged', handleAccountsChanged);
      window.subwallet.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }

      if (window.subwallet) {
        window.subwallet.removeListener('accountsChanged', handleAccountsChanged);
        window.subwallet.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [disconnect]);

  return {
    ...walletState,
    connect,
    disconnect,
  };
}; 