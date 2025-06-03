import { ethers } from 'ethers';
import { store } from '../store';
import {
  setWalletAddress,
  setWalletBalance,
  setChainId,
  setIsConnecting,
  setError,
  disconnectWallet,
} from '../features/wallet/walletSlice';

class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private walletType: 'metamask' | 'subwallet' | null = null;

  async connectWallet(walletType: 'metamask' | 'subwallet'): Promise<void> {
    try {
      if (walletType === 'metamask' && !window.ethereum) {
        throw new Error('MetaMask não está instalado');
      }

      if (walletType === 'subwallet' && !window.subwallet) {
        throw new Error('SubWallet não está instalado');
      }

      store.dispatch(setIsConnecting(true));
      this.walletType = walletType;

      const provider = walletType === 'metamask' ? window.ethereum : window.subwallet;
      this.provider = new ethers.providers.Web3Provider(provider);

      const accounts = await this.provider.send('eth_requestAccounts', []);
      const address = accounts[0];

      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(address);

      store.dispatch(setWalletAddress(address));
      store.dispatch(setWalletBalance(ethers.utils.formatEther(balance)));
      store.dispatch(setChainId(network.chainId));

      // Configurar listeners
      provider.on('accountsChanged', this.handleAccountsChanged);
      provider.on('chainChanged', this.handleChainChanged);
      provider.on('disconnect', this.handleDisconnect);

    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
      store.dispatch(setError(error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      store.dispatch(setIsConnecting(false));
    }
  }

  private handleAccountsChanged = (accounts: string[]): void => {
    if (accounts.length === 0) {
      this.disconnectWallet();
    } else {
      store.dispatch(setWalletAddress(accounts[0]));
      this.updateBalance();
    }
  };

  private handleChainChanged = (chainId: string): void => {
    store.dispatch(setChainId(parseInt(chainId, 16)));
    this.updateBalance();
  };

  private handleDisconnect = (): void => {
    this.disconnectWallet();
  };

  private async updateBalance(): Promise<void> {
    if (!this.provider || !store.getState().wallet.address) return;

    try {
      const balance = await this.provider.getBalance(store.getState().wallet.address);
      store.dispatch(setWalletBalance(ethers.utils.formatEther(balance)));
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
    }
  }

  disconnectWallet(): void {
    if (this.walletType === 'metamask' && window.ethereum) {
      window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', this.handleChainChanged);
      window.ethereum.removeListener('disconnect', this.handleDisconnect);
    } else if (this.walletType === 'subwallet' && window.subwallet) {
      window.subwallet.removeListener('accountsChanged', this.handleAccountsChanged);
      window.subwallet.removeListener('chainChanged', this.handleChainChanged);
      window.subwallet.removeListener('disconnect', this.handleDisconnect);
    }

    store.dispatch(disconnectWallet());
    this.provider = null;
    this.walletType = null;
  }

  getProvider(): ethers.providers.Web3Provider | null {
    return this.provider;
  }

  getWalletType(): 'metamask' | 'subwallet' | null {
    return this.walletType;
  }
}

export const web3Service = new Web3Service(); 