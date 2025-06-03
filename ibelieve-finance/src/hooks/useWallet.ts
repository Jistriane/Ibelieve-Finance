import { useState, useCallback, useEffect } from 'react';
import { web3Service } from '../services/web3';

interface WalletState {
  address: string | null;
  balance: string | null;
  loading: boolean;
  error: string | null;
}

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: null,
    loading: false,
    error: null,
  });

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const address = await web3Service.connect();
      const balance = await web3Service.getBalance();
      setState(prev => ({ ...prev, address, balance, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      balance: null,
      loading: false,
      error: null,
    });
  }, []);

  const updateBalance = useCallback(async () => {
    if (!state.address) return;

    try {
      const balance = await web3Service.getBalance();
      setState(prev => ({ ...prev, balance }));
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
    }
  }, [state.address]);

  useEffect(() => {
    const checkConnection = async () => {
      if (web3Service.isConnected()) {
        const address = web3Service.getAccount();
        if (address) {
          setState(prev => ({ ...prev, address }));
          updateBalance();
        }
      }
    };

    checkConnection();
  }, [updateBalance]);

  return {
    ...state,
    connect,
    disconnect,
    updateBalance,
    isConnected: web3Service.isConnected(),
  };
}; 