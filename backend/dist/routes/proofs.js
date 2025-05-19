"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blockchain_1 = require("../services/blockchain");
const router = (0, express_1.Router)();
const blockchainService = new blockchain_1.BlockchainService();
router.post('/register', async (req, res) => {
    try {
        const { proof, requestedAmount, netWorth, isApproved, walletAddress } = req.body;
        if (!proof || !requestedAmount || !netWorth || typeof isApproved !== 'boolean' || !walletAddress) {
            return res.status(400).json({ error: 'Parâmetros inválidos' });
        }
        const proofHash = await blockchainService.registerProof(proof, requestedAmount, netWorth, isApproved, walletAddress);
        res.json({ proofHash });
    }
    catch (error) {
        console.error('Erro ao registrar prova:', error);
        res.status(500).json({ error: 'Falha ao registrar prova' });
    }
});
router.get('/verify/:proofHash', async (req, res) => {
    try {
        const { proofHash } = req.params;
        const exists = await blockchainService.verifyProof(proofHash);
        if (!exists) {
            return res.status(404).json({ error: 'Prova não encontrada' });
        }
        const details = await blockchainService.getProofDetails(proofHash);
        res.json(details);
    }
    catch (error) {
        console.error('Erro ao verificar prova:', error);
        res.status(500).json({ error: 'Falha ao verificar prova' });
    }
});
exports.default = router;
//# sourceMappingURL=proofs.js.map