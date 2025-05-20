import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { AccountInfo } from '@polkadot/types/interfaces';
import { Keyring } from '@polkadot/keyring';
import { zkVerifyConfig } from '../config/zkverify';

export interface NetworkInfo {
  chainName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  totalIssuance: string;
  stakedAmount: string;
  holders: number;
  isConnected: boolean;
  currentAccount?: string;
}

// Configurações da carteira
const WALLET_CONFIG = {
  name: 'subwallet-js',
  appName: 'iBelieve Finance'
};

export class NetworkService {
  private api: ApiPromise | null = null;
  private provider: WsProvider | null = null;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  private keyring: Keyring | null = null;
  private currentAccount: string | undefined = undefined;

  async connectNetwork(): Promise<void> {
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;

    try {
      console.log(`Conectando à rede ${zkVerifyConfig.name}...`);

      // Inicializar provider
      this.provider = new WsProvider(zkVerifyConfig.endpoints.ws, 60000);

      // Configurar eventos do provider
      this.provider.on('connected', () => console.log('WebSocket conectado'));
      this.provider.on('disconnected', () => console.log('WebSocket desconectado'));
      this.provider.on('error', (error) => console.error('Erro no WebSocket:', error));

      // Criar API
      this.api = await ApiPromise.create({
        provider: this.provider,
        types: {
          TokenSymbol: {
            _enum: ['tVFY']
          },
          TokenData: {
            symbol: 'TokenSymbol',
            decimals: 'u8',
            total_supply: 'Balance'
          }
        }
      });

      // Aguardar API estar pronta
      await this.api.isReady;
      console.log('API inicializada');
      console.log('Rede conectada! Agora você pode conectar sua carteira.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro durante a conexão com a rede:', errorMessage);
      
      // Limpar recursos em caso de erro
      if (this.provider) {
        await this.provider.disconnect();
        this.provider = null;
      }
      this.api = null;
      
      throw new Error(`Falha ao conectar à rede: ${errorMessage}`);
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  async connectWallet(): Promise<void> {
    if (!this.api) {
      throw new Error('Conecte-se à rede primeiro usando connectNetwork()');
    }

    try {
      console.log('Iniciando conexão com SubWallet...');
      
      // Habilitar extensão SubWallet
      const extensions = await web3Enable(WALLET_CONFIG.appName);
      const subwallet = extensions.find(ext => ext.name === WALLET_CONFIG.name);
      
      if (!subwallet) {
        throw new Error('SubWallet não encontrada. Por favor, instale a extensão SubWallet.');
      }

      console.log('SubWallet encontrada:', subwallet.name, subwallet.version);

      // Solicitar acesso às contas
      const accounts = await web3Accounts();
      console.log('Contas disponíveis:', accounts.length);

      if (accounts.length === 0) {
        throw new Error('Nenhuma conta encontrada na SubWallet. Por favor, importe uma conta.');
      }

      // Usar a primeira conta disponível
      const selectedAccount = accounts[0];
      
      // Configurar a conta
      const injector = await web3FromSource(selectedAccount.meta.source);
      this.api.setSigner(injector.signer);
      this.currentAccount = selectedAccount.address;

      console.log('Conta conectada:', {
        address: selectedAccount.address,
        name: selectedAccount.meta.name,
        network: zkVerifyConfig.name,
        token: zkVerifyConfig.token
      });

      // Verificar saldo
      const accountInfo = await this.api.query.system.account(selectedAccount.address);
      console.log('Informações da conta:', accountInfo.toHuman());

    } catch (error) {
      console.error('Erro ao conectar com SubWallet:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.provider) {
        await this.provider.disconnect();
        this.provider = null;
      }
      this.api = null;
      this.currentAccount = undefined;
      console.log('Desconectado da rede');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  }

  async getNetworkInfo(): Promise<NetworkInfo> {
    if (!this.api) {
      throw new Error('API não inicializada. Por favor, conecte-se à rede primeiro.');
    }

    try {
      const [totalIssuance, stakedAmount, holders] = await Promise.all([
        this.api.query.balances.totalIssuance(),
        this.api.query.staking.total(),
        this.api.query.system.accountCount()
      ]);

      return {
        chainName: zkVerifyConfig.name,
        tokenSymbol: zkVerifyConfig.token,
        tokenDecimals: zkVerifyConfig.decimals,
        totalIssuance: totalIssuance.toString(),
        stakedAmount: stakedAmount.toString(),
        holders: parseInt(holders.toString()),
        isConnected: this.api.isConnected,
        currentAccount: this.currentAccount
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao obter informações da rede: ${errorMessage}`);
    }
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.api) {
      throw new Error('API não inicializada. Por favor, conecte-se à rede primeiro.');
    }

    try {
      const targetAddress = address || this.currentAccount;
      if (!targetAddress) {
        throw new Error('Nenhum endereço fornecido e nenhuma conta conectada');
      }

      const accountInfo = await this.api.query.system.account(targetAddress) as unknown as AccountInfo;
      return accountInfo.data.free.toString();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao obter saldo: ${errorMessage}`);
    }
  }

  isConnected(): boolean {
    return this.api?.isConnected || false;
  }

  isWalletConnected(): boolean {
    return !!this.currentAccount;
  }

  getCurrentAccount(): string | undefined {
    return this.currentAccount;
  }

  getNetworkConfig() {
    return zkVerifyConfig;
  }

  getWalletConfig() {
    return WALLET_CONFIG;
  }
}

export const networkService = new NetworkService(); 