import Web3 from 'web3';
import { CONFIG, ERRORS } from '../../config/constants';

interface EthereumError {
  code: number;
  message: string;
}

interface EthereumWindow extends Window {
  ethereum?: any;
}

declare const window: EthereumWindow;

class Web3Service {
  private web3: Web3 | null = null;
  private account: string | null = null;

  async connect(): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask não encontrado');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.web3 = new Web3(window.ethereum);
      const accounts = await this.web3.eth.getAccounts();
      this.account = accounts[0];

      const chainId = await this.web3.eth.getChainId();
      if (chainId !== CONFIG.NETWORK.CHAIN_ID) {
        throw new Error(ERRORS.NETWORK_MISMATCH);
      }

      return this.account;
    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
      throw new Error(ERRORS.WALLET_CONNECTION);
    }
  }

  async getBalance(): Promise<string> {
    if (!this.web3 || !this.account) {
      throw new Error('Web3 não inicializado');
    }

    const balance = await this.web3.eth.getBalance(this.account);
    return this.web3.utils.fromWei(balance, 'ether');
  }

  async switchNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask não encontrado');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CONFIG.NETWORK.CHAIN_ID.toString(16)}` }],
      });
    } catch (error) {
      const ethError = error as EthereumError;
      if (ethError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${CONFIG.NETWORK.CHAIN_ID.toString(16)}`,
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [CONFIG.WEB3.RPC_URL],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }

  isConnected(): boolean {
    return !!this.account;
  }

  getAccount(): string | null {
    return this.account;
  }
}

export const web3Service = new Web3Service(); 