import { body, param } from 'express-validator';

export const aiValidation = {
  analyzeTransaction: [
    body('transactionId')
      .isString()
      .notEmpty()
      .withMessage('ID da transação é obrigatório'),
  ],

  getRiskAssessment: [
    param('userId')
      .isString()
      .notEmpty()
      .withMessage('ID do usuário é obrigatório'),
  ],

  getFraudPrediction: [
    param('transactionId')
      .isString()
      .notEmpty()
      .withMessage('ID da transação é obrigatório'),
  ],
}; 