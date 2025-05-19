import { ethers } from 'ethers';
import { keccak256 } from 'ethers/lib/utils';
import ProofRegistry from '../../artifacts/contracts/ProofRegistry.sol/ProofRegistry.json';

export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    try {
      // Configuração do provedor e carteira
      console.log('Iniciando conexão com a testnet do zkVerify...');
      console.log('ETHEREUM_RPC_URL:', process.env.ETHEREUM_RPC_URL);
      
      // Configuração do provedor
      this.provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL, {
        name: 'zkverify-testnet',
        chainId: 14000 // Chain ID da testnet do zkVerify
      });
      
      // Verifica conexão com a rede
      this.provider.getNetwork().then(network => {
        console.log('Conectado à rede:', network);
      }).catch(error => {
        console.error('Erro ao conectar à rede:', error);
        throw new Error('Não foi possível conectar à testnet do zkVerify. Verifique a URL e a conexão.');
      });

      // Configuração da carteira SubWallet
      if (!process.env.SUBWALLET_ENDPOINT || !process.env.SUBWALLET_TOKEN) {
        throw new Error('Configuração da carteira SubWallet incompleta');
      }
      console.log('Carteira SubWallet configurada:', process.env.SUBWALLET_ENDPOINT);
      console.log('Token SubWallet:', process.env.SUBWALLET_TOKEN);

      // Configuração da carteira
      if (!process.env.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY não definida');
      }
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      console.log('Carteira configurada:', this.wallet.address);
    
      // Configuração do contrato
      if (!process.env.PROOF_REGISTRY_ADDRESS) {
        throw new Error('PROOF_REGISTRY_ADDRESS não definida');
      }
      this.contract = new ethers.Contract(
        process.env.PROOF_REGISTRY_ADDRESS,
        ProofRegistry.abi,
        this.wallet
      );
      console.log('Contrato configurado:', process.env.PROOF_REGISTRY_ADDRESS);
    } catch (error) {
      console.error('Erro ao inicializar BlockchainService:', error);
      throw error;
    }
  }

  // Gera um hash único para a prova
  private generateProofHash(proof: any): string {
    const proofString = JSON.stringify(proof);
    return keccak256(ethers.utils.toUtf8Bytes(proofString));
  }

  // Registra uma prova na blockchain
  async registerProof(
    proof: any,
    requestedAmount: number,
    netWorth: number,
    isApproved: boolean,
    walletAddress: string
  ): Promise<string> {
    try {
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
      const requestedAmountBN = ethers.BigNumber.from(requestedAmount.toString());
      const netWorthBN = ethers.BigNumber.from(netWorth.toString());

      console.log('Dados preparados:', {
        proofHash,
        requestedAmountBN: requestedAmountBN.toString(),
        netWorthBN: netWorthBN.toString(),
        isApproved,
        walletAddress
      });

      // Verifica saldo da carteira
      const balance = await this.wallet.getBalance();
      console.log('Saldo da carteira:', ethers.utils.formatEther(balance), 'ETH');

      if (balance.isZero()) {
        throw new Error('Carteira sem saldo para realizar a transação');
      }

      // Registra a prova
      console.log('Enviando transação...');
      const tx = await this.contract.registerProof(
        proofHash,
        requestedAmountBN,
        netWorthBN,
        isApproved,
        walletAddress
      );
      console.log('Transação enviada:', tx.hash);

      // Aguarda confirmação
      console.log('Aguardando confirmação...');
      await tx.wait();
      console.log('Transação confirmada!');

      return proofHash;
    } catch (error) {
      console.error('Erro detalhado ao registrar prova:', error);
      throw new Error(`Falha ao registrar prova na blockchain: ${error.message}`);
    }
  }

  // Verifica se uma prova existe na blockchain
  async verifyProof(proofHash: string): Promise<boolean> {
    try {
      return await this.contract.verifyProof(proofHash);
    } catch (error) {
      console.error('Erro ao verificar prova na blockchain:', error);
      throw new Error('Falha ao verificar prova na blockchain');
    }
  }

  // Obtém os detalhes de uma prova da blockchain
  async getProofDetails(proofHash: string): Promise<{
    timestamp: number;
    requestedAmount: number;
    netWorth: number;
    isApproved: boolean;
    walletAddress: string;
  }> {
    try {
      const details = await this.contract.getProofDetails(proofHash);
      
      return {
        timestamp: details.timestamp.toNumber(),
        requestedAmount: details.requestedAmount.toNumber(),
        netWorth: details.netWorth.toNumber(),
        isApproved: details.isApproved,
        walletAddress: details.walletAddress
      };
    } catch (error) {
      console.error('Erro ao obter detalhes da prova na blockchain:', error);
      throw new Error('Falha ao obter detalhes da prova na blockchain');
    }
  }
} 