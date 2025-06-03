import { Request, Response } from 'express';
import { feedbackService } from '../services/feedback.service';
import { Logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';
import { IFeedback } from '../types';
import logger from '../services/logger.service';

export class FeedbackController {
  private logger: Logger;

  constructor() {
    this.logger = new Logger({
      ENABLED: true,
      LEVEL: 'info',
      FILE_PATH: './logs/feedback.log',
    });
  }

  public async addFeedback(req: Request, res: Response): Promise<void> {
    try {
      const {
        analysisId,
        transactionId,
        userId,
        feedbackType,
        rating,
        comment,
        wasAccurate,
        actualOutcome,
      } = req.body;

      // Validação básica
      if (!analysisId || !transactionId || !userId || !feedbackType || !rating) {
        res.status(400).json({
          error: 'Dados incompletos',
          details: 'Todos os campos obrigatórios devem ser fornecidos',
          requiredFields: ['analysisId', 'transactionId', 'userId', 'feedbackType', 'rating'],
        });
        return;
      }

      // Validação do tipo de feedback
      if (!['accuracy', 'usefulness', 'speed'].includes(feedbackType)) {
        res.status(400).json({
          error: 'Tipo de feedback inválido',
          details: 'O tipo de feedback deve ser um dos seguintes: accuracy, usefulness, speed',
        });
        return;
      }

      // Validação da nota
      if (rating < 1 || rating > 5) {
        res.status(400).json({
          error: 'Nota inválida',
          details: 'A nota deve estar entre 1 e 5',
        });
        return;
      }

      const feedback = await feedbackService.addFeedback({
        analysisId,
        transactionId,
        userId,
        feedbackType,
        rating,
        comment,
        wasAccurate,
        actualOutcome,
      });

      this.logger.info('Feedback adicionado com sucesso', {
        analysisId,
        transactionId,
        feedbackType,
      });

      res.status(201).json(feedback);
    } catch (error) {
      this.logger.error('Erro ao adicionar feedback:', error);
      res.status(500).json({
        error: 'Erro ao adicionar feedback',
        details: error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  public async getFeedbackStats(req: Request, res: Response): Promise<void> {
    try {
      const { analysisId } = req.params;

      if (!analysisId) {
        res.status(400).json({
          error: 'ID da análise é obrigatório',
          details: 'O parâmetro analysisId deve ser fornecido na URL',
        });
        return;
      }

      const stats = await feedbackService.getFeedbackStats(analysisId);

      this.logger.info('Estatísticas de feedback recuperadas', {
        analysisId,
        totalFeedback: stats.totalFeedback,
      });

      res.json(stats);
    } catch (error) {
      this.logger.error('Erro ao buscar estatísticas de feedback:', error);
      res.status(500).json({
        error: 'Erro ao buscar estatísticas de feedback',
        details: error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  public async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const { analysisId, transactionId, rating, comment } = req.body;

      if (!analysisId || !transactionId || rating === undefined) {
        return res.status(400).json({ message: 'Dados incompletos' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating deve estar entre 1 e 5' });
      }

      const feedback: IFeedback = {
        id: 'mock-feedback-id', // TODO: Implementar geração de ID
        analysisId,
        transactionId,
        userId,
        rating,
        comment,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // TODO: Implementar serviço de feedback
      // const savedFeedback = await feedbackService.create(feedback);

      logger.info('Feedback criado com sucesso', {
        userId,
        analysisId,
        transactionId,
        feedbackId: feedback.id
      });

      return res.status(201).json(feedback);
    } catch (error) {
      logger.error('Erro ao criar feedback', error as Error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  public async getByAnalysis(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { analysisId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // TODO: Implementar serviço de feedback
      // const feedback = await feedbackService.getByAnalysis(analysisId, userId);

      // Mock de feedback para exemplo
      const feedback: IFeedback = {
        id: 'mock-feedback-id',
        analysisId,
        transactionId: 'mock-transaction-id',
        userId,
        rating: 4,
        comment: 'Análise precisa',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback não encontrado' });
      }

      if (feedback.userId !== userId) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      return res.json(feedback);
    } catch (error) {
      logger.error('Erro ao buscar feedback', error as Error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  public async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const { rating, comment } = req.body;

      if (rating !== undefined && (rating < 1 || rating > 5)) {
        return res.status(400).json({ message: 'Rating deve estar entre 1 e 5' });
      }

      // TODO: Implementar serviço de feedback
      // const feedback = await feedbackService.getById(id);

      // Mock de feedback para exemplo
      const feedback: IFeedback = {
        id,
        analysisId: 'mock-analysis-id',
        transactionId: 'mock-transaction-id',
        userId,
        rating: 4,
        comment: 'Análise precisa',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback não encontrado' });
      }

      if (feedback.userId !== userId) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const updatedFeedback = {
        ...feedback,
        rating: rating !== undefined ? rating : feedback.rating,
        comment: comment !== undefined ? comment : feedback.comment,
        updatedAt: new Date()
      };

      // TODO: Implementar serviço de feedback
      // await feedbackService.update(id, updatedFeedback);

      logger.info('Feedback atualizado com sucesso', {
        userId,
        feedbackId: id
      });

      return res.json(updatedFeedback);
    } catch (error) {
      logger.error('Erro ao atualizar feedback', error as Error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

export const feedbackController = new FeedbackController(); 