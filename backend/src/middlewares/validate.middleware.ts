import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Executa todas as validações
    await Promise.all(validations.map(validation => validation.run(req)));

    // Verifica se houve erros
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Retorna os erros encontrados
    res.status(400).json({
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })),
    });
  };
}; 