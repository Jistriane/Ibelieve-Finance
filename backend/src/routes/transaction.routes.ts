import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { validate } from '../middleware/validation.middleware';
import { transactionValidation } from '../validations/transaction.validation';

const router = Router();
const controller = new TransactionController();

// Rotas de transações
router.post('/', 
  validate(transactionValidation.create),
  controller.create.bind(controller)
);

router.get('/:id',
  validate(transactionValidation.getById),
  controller.getById.bind(controller)
);

router.get('/',
  validate(transactionValidation.list),
  controller.list.bind(controller)
);

router.put('/:id',
  validate(transactionValidation.update),
  controller.update.bind(controller)
);

router.delete('/:id',
  validate(transactionValidation.delete),
  controller.delete.bind(controller)
);

export default router; 