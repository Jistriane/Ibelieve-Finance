import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { blockchainController } from '../controllers/blockchain.controller';
import { zkpController } from '../controllers/zkp.controller';
import transactionRoutes from './transaction.routes';
import analysisRoutes from './analysis.routes';
import feedbackRoutes from './feedback.routes';
import { authRoutes } from './auth.routes';
import { aiRoutes } from './ai.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';

const router = Router();

// Middleware de rate limiting para todas as rotas
router.use(rateLimitMiddleware);

// Middleware de autenticação para todas as rotas protegidas
router.use(authMiddleware);

// Rotas de usuário
router.post('/users', userController.create);
router.get('/users/:id', userController.findById);
router.put('/users/:id', userController.update);

// Rotas de blockchain
router.post('/blockchain/verify-assets', blockchainController.verifyAssets);
router.get('/blockchain/verify-transaction/:transactionHash', blockchainController.verifyTransaction);

// Rotas de ZKP
router.post('/zkp/generate', zkpController.generateProof);
router.get('/zkp/verify/:proofId', zkpController.verifyProof);

// Rotas da API
router.use('/transactions', transactionRoutes);
router.use('/analysis', analysisRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);

export default router; 