import { body, param } from 'express-validator';

export const feedbackValidation = {
  create: [
    body('analysisId')
      .isUUID()
      .withMessage('ID da análise inválido'),
    body('transactionId')
      .isUUID()
      .withMessage('ID da transação inválido'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating deve estar entre 1 e 5'),
    body('comment')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Comentário deve ter no máximo 1000 caracteres')
  ],

  getByAnalysis: [
    param('analysisId')
      .isUUID()
      .withMessage('ID da análise inválido')
  ],

  update: [
    param('id')
      .isUUID()
      .withMessage('ID inválido'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating deve estar entre 1 e 5'),
    body('comment')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Comentário deve ter no máximo 1000 caracteres')
  ]
}; 