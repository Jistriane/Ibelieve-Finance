import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import logger from '../services/logger.service';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    // Executar todas as validações
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Erro de validação', {
        path: req.path,
        errors: errors.array()
      });
      
      return res.status(400).json({
        message: 'Erro de validação',
        errors: errors.array()
      });
    }

    next();
  };
}; 