import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { feedbackValidation } from '../validations/feedback.validation';

const router = Router();
const controller = new FeedbackController();

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rotas de feedback
router.post('/',
  validate(feedbackValidation.create),
  controller.create.bind(controller)
);

router.get('/analysis/:analysisId',
  validate(feedbackValidation.getByAnalysis),
  controller.getByAnalysis.bind(controller)
);

router.put('/:id',
  validate(feedbackValidation.update),
  controller.update.bind(controller)
);

// Adicionar feedback
router.post(
  '/',
  validate(feedbackValidation.addFeedback),
  controller.addFeedback.bind(controller)
);

// Obter estatísticas de feedback
router.get(
  '/stats/:analysisId',
  validate(feedbackValidation.getFeedbackStats),
  controller.getFeedbackStats.bind(controller)
);

export default router; 