import { Router } from 'express';
import { AnalysisController } from '../controllers/analysis.controller';

const router = Router();
const controller = new AnalysisController();

// Rotas de análise
router.post('/transaction/:transactionId', controller.analyze.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.get('/transaction/:transactionId', controller.listByTransaction.bind(controller));

export default router; 