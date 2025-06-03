import Web3 from 'web3';
import { CONFIG } from '../../config/constants';
import { web3Service } from '../web3';

// ABI mínimo para as funções que precisamos
const ZKProofRegistryABI = [
  {
    inputs: [{ type: 'bytes32', name: 'proofHash' }],
    name: 'registerProof',
    outputs: [{ type: 'bool', name: 'success' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ type: 'bytes32', name: 'proofHash' }],
    name: 'verifyProof',
    outputs: [{ type: 'bool', name: 'isValid' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getStatistics',
    outputs: [
      { type: 'uint256', name: 'totalProofs' },
      { type: 'uint256', name: 'verifiedProofs' },
      { type: 'uint256', name: 'totalTokensBurned' },
      { type: 'uint256', name: 'activeSubwallets' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

interface ProofStatistics {
  totalProofs: string;
  verifiedProofs: string;
  totalTokensBurned: string;
  activeSubwallets: string;
}

class ZKProofRegistryService {
  private contract: any = null;

  constructor() {
    if (CONFIG.CONTRACTS.ZKPROOF_REGISTRY) {
      const web3 = new Web3(window.ethereum);
      this.contract = new web3.eth.Contract(
        ZKProofRegistryABI,
        CONFIG.CONTRACTS.ZKPROOF_REGISTRY
      );
    }
  }

  private checkInitialization() {
    if (!this.contract) {
      throw new Error('Contrato ZKProofRegistry não inicializado');
    }
    if (!web3Service.isConnected()) {
      throw new Error('Carteira não conectada');
    }
  }

  async registerProof(proofData: string): Promise<boolean> {
    this.checkInitialization();
    const account = web3Service.getAccount();
    if (!account) throw new Error('Conta não encontrada');

    const proofHash = Web3.utils.sha3(proofData);
    if (!proofHash) throw new Error('Erro ao gerar hash da prova');

    try {
      const result = await this.contract.methods
        .registerProof(proofHash)
        .send({ from: account });
      
      return result.status;
    } catch (error) {
      console.error('Erro ao registrar prova:', error);
      throw new Error('Falha ao registrar prova');
    }
  }

  async verifyProof(proofData: string): Promise<boolean> {
    this.checkInitialization();
    
    const proofHash = Web3.utils.sha3(proofData);
    if (!proofHash) throw new Error('Erro ao gerar hash da prova');

    try {
      return await this.contract.methods.verifyProof(proofHash).call();
    } catch (error) {
      console.error('Erro ao verificar prova:', error);
      throw new Error('Falha ao verificar prova');
    }
  }

  async getStatistics(): Promise<ProofStatistics> {
    this.checkInitialization();

    try {
      const stats = await this.contract.methods.getStatistics().call();
      return {
        totalProofs: stats.totalProofs.toString(),
        verifiedProofs: stats.verifiedProofs.toString(),
        totalTokensBurned: Web3.utils.fromWei(stats.totalTokensBurned, 'ether'),
        activeSubwallets: stats.activeSubwallets.toString(),
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Falha ao buscar estatísticas');
    }
  }
}

export const zkProofRegistryService = new ZKProofRegistryService(); 