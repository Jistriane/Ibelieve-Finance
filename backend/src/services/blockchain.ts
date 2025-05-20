import { ApiPromise, WsProvider } from '@polkadot/api';
import { ISubmittableResult } from '@polkadot/types/types';
import { Option } from '@polkadot/types';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env-dev' });

interface ProofDetails {
  timestamp: number;
  requestedAmount: number;
  netWorth: number;
  isApproved: boolean;
  walletAddress: string;
}

export class BlockchainService {
  private api: ApiPromise | null = null;
  private wsEndpoint: string;

  constructor() {
    this.wsEndpoint = process.env.WS_ENDPOINT || 'ws://localhost:9944';
    console.log('BlockchainService inicializado com endpoint:', this.wsEndpoint);
  }

  private async ensureApiInitialized() {
    if (!this.api) {
      console.log('Inicializando conexão com a blockchain...');
      try {
        const provider = new WsProvider(this.wsEndpoint);
        this.api = await ApiPromise.create({ provider });
        await this.api.isReady;
        console.log('Conexão com a blockchain estabelecida com sucesso');
      } catch (error) {
        console.error('Erro ao inicializar API:', error);
        throw new Error(`Falha ao conectar com a blockchain: ${error.message}`);
      }
    }
  }

  private generateProofHash(proof: any): string {
    try {
      console.log('Gerando hash da prova...');
      const proofString = JSON.stringify(proof);
      console.log('Prova serializada:', proofString.substring(0, 100) + '...');
      
      if (!this.api) {
        throw new Error('API não inicializada');
      }

      const hash = this.api.createType('Hash', proofString).toHex();
      console.log('Hash gerado:', hash);
      return hash;
    } catch (error) {
      console.error('Erro ao gerar hash da prova:', error);
      throw new Error(`Falha ao gerar hash da prova: ${error.message}`);
    }
  }

  async registerProof(
    proof: any,
    requestedAmount: number,
    netWorth: number,
    isApproved: boolean,
    walletAddress: string
  ): Promise<string> {
    try {
      await this.ensureApiInitialized();
      if (!this.api) {
        throw new Error('API não inicializada');
      }

      console.log('Iniciando registro de prova na blockchain...');
      console.log('Parâmetros:', {
        requestedAmount,
        netWorth,
        isApproved,
        walletAddress,
        proofSize: JSON.stringify(proof).length
      });

      if (requestedAmount === undefined || netWorth === undefined || isApproved === undefined || !walletAddress) {
        throw new Error('Parâmetros inválidos para registrar prova');
      }

      const proofHash = this.generateProofHash(proof);
      const requestedAmountBN = this.api.createType('Balance', requestedAmount.toString());
      const netWorthBN = this.api.createType('Balance', netWorth.toString());

      console.log('Dados preparados:', {
        proofHash,
        requestedAmountBN: requestedAmountBN.toString(),
        netWorthBN: netWorthBN.toString(),
        isApproved,
        walletAddress
      });

      // Registra a prova
      console.log('Enviando transação...');
      const tx = await this.api.tx.proofRegistry.registerProof(
        proofHash,
        requestedAmountBN,
        netWorthBN,
        isApproved,
        walletAddress
      );

      console.log('Transação criada, aguardando assinatura...');
      
      return new Promise((resolve, reject) => {
        tx.signAndSend(walletAddress, (result: ISubmittableResult) => {
          console.log('Status da transação:', result.status.toString());
          
          if (result.status.isInBlock) {
            console.log('Transação incluída no bloco:', result.status.asInBlock.toHex());
          }
          
          if (result.status.isFinalized) {
            console.log('Transação finalizada:', result.status.asFinalized.toHex());
            resolve(proofHash);
          }
          
          if (result.isError) {
            console.error('Erro na transação:', result.toString());
            reject(new Error('Transação falhou'));
          }
        }).catch(error => {
          console.error('Erro ao enviar transação:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Erro detalhado ao registrar prova:', error);
      throw new Error(`Falha ao registrar prova na blockchain: ${error.message}`);
    }
  }

  // Verifica se uma prova existe na blockchain
  async verifyProof(proofHash: string): Promise<boolean> {
    try {
      await this.ensureApiInitialized();
      if (!this.api) {
        throw new Error('API não inicializada');
      }
      const result = await this.api.query.proofRegistry.verifyProof(proofHash) as Option<any>;
      return result.isSome;
    } catch (error) {
      console.error('Erro ao verificar prova na blockchain:', error);
      throw new Error('Falha ao verificar prova na blockchain');
    }
  }

  // Obtém os detalhes de uma prova da blockchain
  async getProofDetails(proofHash: string): Promise<ProofDetails> {
    try {
      await this.ensureApiInitialized();
      if (!this.api) {
        throw new Error('API não inicializada');
      }
      const details = await this.api.query.proofRegistry.getProofDetails(proofHash) as Option<any>;
      
      if (!details.isSome) {
        throw new Error('Prova não encontrada');
      }

      const proofData = details.unwrap();
      return {
        timestamp: proofData.timestamp.toNumber(),
        requestedAmount: proofData.requestedAmount.toNumber(),
        netWorth: proofData.netWorth.toNumber(),
        isApproved: proofData.isApproved,
        walletAddress: proofData.walletAddress.toString()
      };
    } catch (error) {
      console.error('Erro ao obter detalhes da prova na blockchain:', error);
      throw new Error('Falha ao obter detalhes da prova na blockchain');
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.api) {
        await this.api.disconnect();
        this.api = null;
      }
      console.log('Desconectado da rede');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  }
} 