import { Request, Response } from 'express';
import { blockchainService } from '../services';
import { BlockchainVerificationSchema } from '../models';

export const blockchainController = {
  async verifyAssets(req: Request, res: Response): Promise<void> {
    try {
      const { transactionHash } = req.body;

      // Validar entrada
      if (!transactionHash) {
        res.status(400).json({
          error: 'validation_error',
          message: 'Hash da transação é obrigatório'
        });
        return;
      }

      // Verificar ativos
      const verification = await blockchainService.verifyAssets(transactionHash);

      // Validar resultado com Zod
      const validatedVerification = BlockchainVerificationSchema.parse(verification);

      res.json({
        success: true,
        data: validatedVerification
      });
    } catch (error) {
      console.error('Erro ao verificar ativos:', error);
      res.status(500).json({
        error: 'internal_server_error',
        message: 'Erro ao verificar ativos'
      });
    }
  },

  async verifyTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { transactionHash } = req.params;

      // Verificar transação
      const verification = await blockchainService.verifyTransaction(transactionHash);

      if (!verification) {
        res.status(404).json({
          error: 'not_found',
          message: 'Transação não encontrada'
        });
        return;
      }

      // Validar resultado com Zod
      const validatedVerification = BlockchainVerificationSchema.parse(verification);

      res.json({
        success: true,
        data: validatedVerification
      });
    } catch (error) {
      console.error('Erro ao verificar transação:', error);
      res.status(500).json({
        error: 'internal_server_error',
        message: 'Erro ao verificar transação'
      });
    }
  }
}; 