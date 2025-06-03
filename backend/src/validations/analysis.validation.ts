import { param } from 'express-validator';

export const analysisValidation = {
  analyze: [
    param('transactionId')
      .isUUID()
      .withMessage('ID da transação inválido')
  ],

  getById: [
    param('id')
      .isUUID()
      .withMessage('ID inválido')
  ],

  listByTransaction: [
    param('transactionId')
      .isUUID()
      .withMessage('ID da transação inválido')
  ]
}; 