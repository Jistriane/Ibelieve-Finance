import { Router } from 'express';
import { BlockchainService } from '../services/blockchain';

const router = Router();

// Rota para registrar uma nova prova
router.post('/register', async (req, res) => {
  try {
    console.log('Recebendo requisição de registro de prova...');
    const { proof, requestedAmount, netWorth, isApproved, walletAddress } = req.body;
    console.log('Dados recebidos:', {
      requestedAmount,
      netWorth,
      isApproved,
      walletAddress,
      proofSize: JSON.stringify(proof).length
    });

    // Validação dos inputs
    if (!proof || !requestedAmount || !netWorth || typeof isApproved !== 'boolean' || !walletAddress) {
      console.error('Parâmetros inválidos:', { proof, requestedAmount, netWorth, isApproved, walletAddress });
      return res.status(400).json({ error: 'Parâmetros inválidos' });
    }

    // Instancia o serviço de blockchain aqui, após dotenv já ter rodado
    console.log('Iniciando serviço de blockchain...');
    const blockchainService = new BlockchainService();

    // Registra a prova na blockchain
    console.log('Registrando prova na blockchain...');
    const proofHash = await blockchainService.registerProof(
      proof,
      requestedAmount,
      netWorth,
      isApproved,
      walletAddress
    );

    console.log('Prova registrada com sucesso. Hash:', proofHash);
    return res.json({ proofHash });
  } catch (error) {
    console.error('Erro ao registrar prova:', error);
    return res.status(500).json({ error: 'Falha ao registrar prova' });
  }
});

// Rota para verificar uma prova
router.get('/verify/:proofHash', async (req, res) => {
  try {
    const { proofHash } = req.params;

    // Instancia o serviço de blockchain aqui
    const blockchainService = new BlockchainService();

    // Verifica se a prova existe
    const exists = await blockchainService.verifyProof(proofHash);
    
    if (!exists) {
      return res.status(404).json({ error: 'Prova não encontrada' });
    }

    // Obtém os detalhes da prova
    const details = await blockchainService.getProofDetails(proofHash);
    
    return res.json(details);
  } catch (error) {
    console.error('Erro ao verificar prova:', error);
    return res.status(500).json({ error: 'Falha ao verificar prova' });
  }
});

export default router; 