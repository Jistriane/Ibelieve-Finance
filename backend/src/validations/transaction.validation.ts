import { body, param, query } from 'express-validator';

export const transactionValidation = {
  create: [
    body('type')
      .isIn(['INCOME', 'EXPENSE', 'TRANSFER'])
      .withMessage('Tipo de transação inválido'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Valor deve ser maior que zero'),
    body('description')
      .isString()
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Descrição deve ter entre 3 e 255 caracteres'),
    body('category')
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Categoria deve ter entre 2 e 50 caracteres'),
    body('date')
      .isISO8601()
      .withMessage('Data inválida')
  ],

  update: [
    param('id')
      .isUUID()
      .withMessage('ID inválido'),
    body('type')
      .optional()
      .isIn(['INCOME', 'EXPENSE', 'TRANSFER'])
      .withMessage('Tipo de transação inválido'),
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Valor deve ser maior que zero'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Descrição deve ter entre 3 e 255 caracteres'),
    body('category')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Categoria deve ter entre 2 e 50 caracteres'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Data inválida'),
    body('status')
      .optional()
      .isIn(['PENDING', 'COMPLETED', 'CANCELLED'])
      .withMessage('Status inválido')
  ],

  getById: [
    param('id')
      .isUUID()
      .withMessage('ID inválido')
  ],

  list: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página inválida'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite inválido'),
    query('status')
      .optional()
      .isIn(['PENDING', 'COMPLETED', 'CANCELLED'])
      .withMessage('Status inválido'),
    query('type')
      .optional()
      .isIn(['INCOME', 'EXPENSE', 'TRANSFER'])
      .withMessage('Tipo inválido')
  ],

  delete: [
    param('id')
      .isUUID()
      .withMessage('ID inválido')
  ]
}; 