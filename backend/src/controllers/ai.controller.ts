import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import { transactionService } from '../services/transaction.service';
import { AI_CONFIG } from '../config/ai.config';
import { RateLimiter } from '../utils/rateLimiter';
import { Logger } from '../utils/logger';

interface IRequestWithIp extends Request {
  ip: string;
}

class AIController {
  private rateLimiter: RateLimiter;
  private logger: Logger;

  constructor() {
    this.rateLimiter = new RateLimiter(AI_CONFIG.RATE_LIMIT);
    this.logger = new Logger(AI_CONFIG.LOGGING);
  }

  public async analyzeTransaction(req: IRequestWithIp, res: Response): Promise<void> {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';

      // Verifica rate limit
      if (!(await this.rateLimiter.checkLimit(ip))) {
        this.logger.warn('Rate limit excedido', { ip });
        res.status(429).json({
          error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
          retryAfter: await this.rateLimiter.getResetTime(ip),
        });
        return;
      }

      const { transactionId } = req.body;

      if (!transactionId) {
        res.status(400).json({
          error: 'ID da transação é obrigatório',
          details: 'O campo transactionId deve ser fornecido no corpo da requisição',
        });
        return;
      }

      // Busca a transação
      const transaction = await transactionService.getTransactionById(transactionId);
      if (!transaction) {
        this.logger.warn('Transação não encontrada', { transactionId });
        res.status(404).json({ 
          error: 'Transação não encontrada',
          details: 'A transação solicitada não existe ou foi removida.'
        });
        return;
      }

      // Realiza a análise
      const analysis = await aiService.analyzeTransaction(transaction);

      this.logger.info('Análise concluída com sucesso', {
        transactionId,
        analysisId: analysis.analysisId,
      });

      res.json(analysis);
    } catch (error) {
      this.logger.error('Erro ao analisar transação:', error);
      res.status(500).json({
        error: 'Erro ao analisar transação',
        details: error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  public async getRiskAssessment(req: IRequestWithIp, res: Response): Promise<void> {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';

      // Verifica rate limit
      if (!(await this.rateLimiter.checkLimit(ip))) {
        this.logger.warn('Rate limit excedido', { ip });
        res.status(429).json({
          error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
          retryAfter: await this.rateLimiter.getResetTime(ip),
        });
        return;
      }

      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          error: 'ID do usuário é obrigatório',
          details: 'O parâmetro userId deve ser fornecido na URL',
        });
        return;
      }

      // Realiza a avaliação de risco
      const assessment = await aiService.getRiskAssessment(userId);

      this.logger.info('Avaliação de risco concluída', { userId });

      res.json(assessment);
    } catch (error) {
      this.logger.error('Erro ao avaliar risco:', error);
      res.status(500).json({
        error: 'Erro ao avaliar risco',
        details: error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  public async getFraudPrediction(req: IRequestWithIp, res: Response): Promise<void> {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';

      // Verifica rate limit
      if (!(await this.rateLimiter.checkLimit(ip))) {
        this.logger.warn('Rate limit excedido', { ip });
        res.status(429).json({
          error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
          retryAfter: await this.rateLimiter.getResetTime(ip),
        });
        return;
      }

      const { transactionId } = req.params;

      if (!transactionId) {
        res.status(400).json({
          error: 'ID da transação é obrigatório',
          details: 'O parâmetro transactionId deve ser fornecido na URL',
        });
        return;
      }

      // Busca a transação
      const transaction = await transactionService.getTransactionById(transactionId);
      if (!transaction) {
        this.logger.warn('Transação não encontrada', { transactionId });
        res.status(404).json({ 
          error: 'Transação não encontrada',
          details: 'A transação solicitada não existe ou foi removida.'
        });
        return;
      }

      // Realiza a previsão de fraude
      const prediction = await aiService.getFraudPrediction(transactionId);

      this.logger.info('Previsão de fraude concluída', { transactionId });

      res.json(prediction);
    } catch (error) {
      this.logger.error('Erro ao prever fraude:', error);
      res.status(500).json({
        error: 'Erro ao prever fraude',
        details: error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }
}

export const aiController = new AIController(); 