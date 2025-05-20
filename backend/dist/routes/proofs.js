"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blockchain_1 = require("../services/blockchain");
const router = (0, express_1.Router)();
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
        if (!proof || !requestedAmount || !netWorth || typeof isApproved !== 'boolean' || !walletAddress) {
            console.error('Parâmetros inválidos:', { proof, requestedAmount, netWorth, isApproved, walletAddress });
            return res.status(400).json({ error: 'Parâmetros inválidos' });
        }
        console.log('Iniciando serviço de blockchain...');
        const blockchainService = new blockchain_1.BlockchainService();
        console.log('Registrando prova na blockchain...');
        const proofHash = await blockchainService.registerProof(proof, requestedAmount, netWorth, isApproved, walletAddress);
        console.log('Prova registrada com sucesso. Hash:', proofHash);
        return res.json({ proofHash });
    }
    catch (error) {
        console.error('Erro ao registrar prova:', error);
        return res.status(500).json({ error: 'Falha ao registrar prova' });
    }
});
router.get('/verify/:proofHash', async (req, res) => {
    try {
        const { proofHash } = req.params;
        const blockchainService = new blockchain_1.BlockchainService();
        const exists = await blockchainService.verifyProof(proofHash);
        if (!exists) {
            return res.status(404).json({ error: 'Prova não encontrada' });
        }
        const details = await blockchainService.getProofDetails(proofHash);
        return res.json(details);
    }
    catch (error) {
        console.error('Erro ao verificar prova:', error);
        return res.status(500).json({ error: 'Falha ao verificar prova' });
    }
});
exports.default = router;
//# sourceMappingURL=proofs.js.map