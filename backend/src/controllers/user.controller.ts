import { Request, Response } from 'express';
import { userService } from '../services';
import { UserSchema } from '../models';

export const userController = {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress } = req.body;

      // Validar entrada
      if (!walletAddress) {
        res.status(400).json({
          error: 'validation_error',
          message: 'Endereço da carteira é obrigatório'
        });
        return;
      }

      // Criar usuário
      const user = await userService.create(walletAddress);

      // Validar resultado com Zod
      const validatedUser = UserSchema.parse(user);

      res.status(201).json({
        success: true,
        data: validatedUser
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        error: 'internal_server_error',
        message: 'Erro ao criar usuário'
      });
    }
  },

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Buscar usuário
      const user = await userService.findById(id);

      if (!user) {
        res.status(404).json({
          error: 'not_found',
          message: 'Usuário não encontrado'
        });
        return;
      }

      // Validar resultado com Zod
      const validatedUser = UserSchema.parse(user);

      res.json({
        success: true,
        data: validatedUser
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        error: 'internal_server_error',
        message: 'Erro ao buscar usuário'
      });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { walletAddress } = req.body;

      // Validar entrada
      if (!walletAddress) {
        res.status(400).json({
          error: 'validation_error',
          message: 'Endereço da carteira é obrigatório'
        });
        return;
      }

      // Atualizar usuário
      const user = await userService.update(id, walletAddress);

      if (!user) {
        res.status(404).json({
          error: 'not_found',
          message: 'Usuário não encontrado'
        });
        return;
      }

      // Validar resultado com Zod
      const validatedUser = UserSchema.parse(user);

      res.json({
        success: true,
        data: validatedUser
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        error: 'internal_server_error',
        message: 'Erro ao atualizar usuário'
      });
    }
  }
}; 