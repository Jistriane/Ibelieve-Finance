import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { aiValidation } from '../validations/ai.validation';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Análise de transação
router.post(
  '/analyze-transaction',
  validate(aiValidation.analyzeTransaction),
  aiController.analyzeTransaction
);

// Avaliação de risco
router.get(
  '/risk-assessment/:userId',
  validate(aiValidation.getRiskAssessment),
  aiController.getRiskAssessment
);

// Previsão de fraude
router.get(
  '/fraud-prediction/:transactionId',
  validate(aiValidation.getFraudPrediction),
  aiController.getFraudPrediction
);

export const aiRoutes = router; 