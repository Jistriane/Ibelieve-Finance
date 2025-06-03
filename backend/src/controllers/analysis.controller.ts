import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { IAnalysis } from '../types';
import logger from '../services/logger.service';
import { transactionAnalysisCounter, fraudDetectionGauge } from '../services/metrics.service';

export class AnalysisController {
  public async analyze(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { transactionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // TODO: Implementar serviço de análise
      // const analysis = await analysisService.analyze(transactionId, userId);

      // Mock de análise para exemplo
      const analysis: IAnalysis = {
        id: 'mock-analysis-id',
        transactionId,
        userId,
        riskScore: 0.3,
        fraudProbability: 0.1,
        recommendations: [
          'Transação dentro do padrão normal',
          'Valor compatível com histórico'
        ],
        indicators: [],
        analysisDetails: [
          {
            category: 'Valor',
            description: 'Análise do valor da transação',
            score: 0.2
          },
          {
            category: 'Frequência',
            description: 'Análise da frequência de transações',
            score: 0.3
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Atualizar métricas
      transactionAnalysisCounter
        .labels(analysis.riskScore < 0.5 ? 'low_risk' : 'high_risk')
        .inc();

      fraudDetectionGauge
        .labels(transactionId)
        .set(analysis.fraudProbability);

      logger.info('Análise realizada com sucesso', {
        userId,
        transactionId,
        analysisId: analysis.id
      });

      return res.json(analysis);
    } catch (error) {
      logger.error('Erro ao realizar análise', error as Error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  public async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // TODO: Implementar serviço de análise
      // const analysis = await analysisService.getById(id);

      // Mock de análise para exemplo
      const analysis: IAnalysis = {
        id,
        transactionId: 'mock-transaction-id',
        userId,
        riskScore: 0.3,
        fraudProbability: 0.1,
        recommendations: [
          'Transação dentro do padrão normal',
          'Valor compatível com histórico'
        ],
        indicators: [],
        analysisDetails: [
          {
            category: 'Valor',
            description: 'Análise do valor da transação',
            score: 0.2
          },
          {
            category: 'Frequência',
            description: 'Análise da frequência de transações',
            score: 0.3
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!analysis) {
        return res.status(404).json({ message: 'Análise não encontrada' });
      }

      if (analysis.userId !== userId) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      return res.json(analysis);
    } catch (error) {
      logger.error('Erro ao buscar análise', error as Error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  public async listByTransaction(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { transactionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // TODO: Implementar serviço de análise
      // const analyses = await analysisService.listByTransaction(transactionId, userId);

      // Mock de lista para exemplo
      const analyses: IAnalysis[] = [];

      return res.json(analyses);
    } catch (error) {
      logger.error('Erro ao listar análises', error as Error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
} 