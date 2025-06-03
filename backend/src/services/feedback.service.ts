import { Logger } from '../utils/logger';
import { Cache } from '../utils/cache';

export interface IAnalysisFeedback {
  analysisId: string;
  transactionId: string;
  userId: string;
  feedbackType: 'accuracy' | 'usefulness' | 'speed';
  rating: number; // 1-5
  comment?: string;
  wasAccurate: boolean;
  actualOutcome?: string;
  createdAt: Date;
}

export interface IFeedbackStats {
  totalFeedback: number;
  averageRating: number;
  accuracyRate: number;
  feedbackByType: {
    accuracy: number;
    usefulness: number;
    speed: number;
  };
  recentFeedback: IAnalysisFeedback[];
}

class FeedbackService {
  private logger: Logger;
  private cache: Cache;

  constructor() {
    this.logger = new Logger({
      ENABLED: true,
      LEVEL: 'info',
      FILE_PATH: './logs/feedback.log',
    });
    this.cache = new Cache({
      ENABLED: true,
      TTL: 3600, // 1 hora
      MAX_SIZE: 1000,
    });
  }

  public async addFeedback(feedback: Omit<IAnalysisFeedback, 'createdAt'>): Promise<IAnalysisFeedback> {
    try {
      const newFeedback: IAnalysisFeedback = {
        ...feedback,
        createdAt: new Date(),
      };

      // TODO: Implementar persistência no banco de dados

      // Atualiza o cache de estatísticas
      await this.updateFeedbackStats(newFeedback);

      this.logger.info('Feedback registrado com sucesso', {
        analysisId: feedback.analysisId,
        transactionId: feedback.transactionId,
        feedbackType: feedback.feedbackType,
      });

      return newFeedback;
    } catch (error) {
      this.logger.error('Erro ao registrar feedback:', error);
      throw new Error('Falha ao registrar feedback');
    }
  }

  public async getFeedbackStats(analysisId: string): Promise<IFeedbackStats> {
    try {
      const cacheKey = `feedback_stats:${analysisId}`;
      const cachedStats = this.cache.get<IFeedbackStats>(cacheKey);
      
      if (cachedStats) {
        return cachedStats;
      }

      // TODO: Implementar busca no banco de dados
      // Por enquanto, retorna estatísticas mock
      const mockStats: IFeedbackStats = {
        totalFeedback: 0,
        averageRating: 0,
        accuracyRate: 0,
        feedbackByType: {
          accuracy: 0,
          usefulness: 0,
          speed: 0,
        },
        recentFeedback: [],
      };

      this.cache.set(cacheKey, mockStats);
      return mockStats;
    } catch (error) {
      this.logger.error('Erro ao buscar estatísticas de feedback:', error);
      throw new Error('Falha ao buscar estatísticas de feedback');
    }
  }

  private async updateFeedbackStats(newFeedback: IAnalysisFeedback): Promise<void> {
    try {
      const cacheKey = `feedback_stats:${newFeedback.analysisId}`;
      let stats = this.cache.get<IFeedbackStats>(cacheKey);

      if (!stats) {
        stats = {
          totalFeedback: 0,
          averageRating: 0,
          accuracyRate: 0,
          feedbackByType: {
            accuracy: 0,
            usefulness: 0,
            speed: 0,
          },
          recentFeedback: [],
        };
      }

      // Atualiza estatísticas
      stats.totalFeedback++;
      stats.averageRating = (stats.averageRating * (stats.totalFeedback - 1) + newFeedback.rating) / stats.totalFeedback;
      stats.accuracyRate = (stats.accuracyRate * (stats.totalFeedback - 1) + (newFeedback.wasAccurate ? 1 : 0)) / stats.totalFeedback;
      
      // Atualiza contagem por tipo
      stats.feedbackByType[newFeedback.feedbackType]++;

      // Mantém apenas os 10 feedbacks mais recentes
      stats.recentFeedback = [newFeedback, ...stats.recentFeedback].slice(0, 10);

      // Atualiza cache
      this.cache.set(cacheKey, stats);

      this.logger.info('Estatísticas de feedback atualizadas', {
        analysisId: newFeedback.analysisId,
        totalFeedback: stats.totalFeedback,
        averageRating: stats.averageRating,
      });
    } catch (error) {
      this.logger.error('Erro ao atualizar estatísticas de feedback:', error);
      // Não propaga o erro para não afetar o fluxo principal
    }
  }
}

export const feedbackService = new FeedbackService(); 