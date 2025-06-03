import { Request, Response } from 'express';
import { zkpService } from '../services';
import { ZkpProofSchema } from '../models';

export const zkpController = {
  async generateProof(req: Request, res: Response): Promise<void> {
    try {
      const { publicInputs } = req.body;

      // Validar entrada
      if (!publicInputs || !Array.isArray(publicInputs)) {
        res.status(400).json({
          error: 'validation_error',
          message: 'Entradas públicas são obrigatórias e devem ser um array'
        });
        return;
      }

      // Gerar prova
      const proof = await zkpService.generateProof(publicInputs);

      // Validar resultado com Zod
      const validatedProof = ZkpProofSchema.parse(proof);

      res.status(201).json({
        success: true,
        data: validatedProof
      });
    } catch (error) {
      console.error('Erro ao gerar prova:', error);
      res.status(500).json({
        error: 'internal_server_error',
        message: 'Erro ao gerar prova'
      });
    }
  },

  async verifyProof(req: Request, res: Response): Promise<void> {
    try {
      const { proofId } = req.params;

      // Verificar prova
      const isValid = await zkpService.verifyProof(proofId);

      res.json({
        success: true,
        data: { verified: isValid }
      });
    } catch (error) {
      console.error('Erro ao verificar prova:', error);
      res.status(500).json({
        error: 'internal_server_error',
        message: 'Erro ao verificar prova'
      });
    }
  }
}; 