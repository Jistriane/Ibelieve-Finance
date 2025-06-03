import { Configuration, OpenAIApi } from 'openai';
import { AI_CONFIG } from '../config/ai.config';
import { Transaction } from '../models/transaction.model';
import { Logger } from '../utils/logger';
import { Cache } from '../utils/cache';
import { AIResponseProcessor, ProcessedAIResponse } from './processors/aiResponseProcessor';

export interface AIAnalysisResult extends ProcessedAIResponse {
  transactionId: string;
  analysisId: string;
  createdAt: Date;
  updatedAt: Date;
}

class AIService {
  private openai: OpenAIApi;
  private cache: Cache;
  private logger: Logger;
  private processor: AIResponseProcessor;

  constructor() {
    const configuration = new Configuration({
      apiKey: AI_CONFIG.API.KEY,
    });

    this.openai = new OpenAIApi(configuration);
    this.cache = new Cache(AI_CONFIG.CACHE);
    this.logger = new Logger(AI_CONFIG.LOGGING);
    this.processor = new AIResponseProcessor(this.logger);
  }

  public async analyzeTransaction(transaction: Transaction): Promise<AIAnalysisResult> {
    try {
      // Verifica cache
      const cacheKey = `analysis:${transaction.id}`;
      const cachedAnalysis = this.cache.get<AIAnalysisResult>(cacheKey);
      if (cachedAnalysis) {
        return cachedAnalysis;
      }

      // Prepara o prompt para a IA
      const prompt = this.buildAnalysisPrompt(transaction);
      const startTime = Date.now();

      // Faz a chamada para a API da OpenAI
      const response = await this.openai.createCompletion({
        model: AI_CONFIG.MODEL.NAME,
        prompt,
        temperature: AI_CONFIG.MODEL.TEMPERATURE,
        max_tokens: AI_CONFIG.MODEL.MAX_TOKENS,
      });

      const processingTime = Date.now() - startTime;

      // Processa a resposta usando o novo processador
      const processedResponse = this.processor.processResponse(
        response.data.choices[0].text || '',
        {
          name: AI_CONFIG.MODEL.NAME,
          processingTime
        }
      );

      // Cria o resultado final
      const result: AIAnalysisResult = {
        ...processedResponse,
        transactionId: transaction.id,
        analysisId: this.generateAnalysisId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Armazena no cache
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      this.logger.error('Erro ao analisar transação:', error);
      throw new Error('Falha ao analisar transação');
    }
  }

  public async getRiskAssessment(userId: string): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    score: number;
    factors: string[];
  }> {
    try {
      const cacheKey = `risk:${userId}`;
      const cachedAssessment = this.cache.get(cacheKey);
      if (cachedAssessment) {
        return cachedAssessment;
      }

      // TODO: Implementar lógica real de avaliação de risco
      const assessment = {
        riskLevel: 'low' as const,
        score: 0.2,
        factors: ['Histórico positivo', 'Transações regulares'],
      };

      this.cache.set(cacheKey, assessment);
      return assessment;
    } catch (error) {
      this.logger.error('Erro ao avaliar risco:', error);
      throw new Error('Falha ao avaliar risco');
    }
  }

  public async getFraudPrediction(transactionId: string): Promise<{
    probability: number;
    indicators: string[];
    recommendation: string;
  }> {
    try {
      const cacheKey = `fraud:${transactionId}`;
      const cachedPrediction = this.cache.get(cacheKey);
      if (cachedPrediction) {
        return cachedPrediction;
      }

      // TODO: Implementar lógica real de detecção de fraude
      const prediction = {
        probability: 0.1,
        indicators: ['Valor dentro do padrão', 'Localização conhecida'],
        recommendation: 'Transação parece segura',
      };

      this.cache.set(cacheKey, prediction);
      return prediction;
    } catch (error) {
      this.logger.error('Erro ao prever fraude:', error);
      throw new Error('Falha ao prever fraude');
    }
  }

  private buildAnalysisPrompt(transaction: Transaction): string {
    return `
      Por favor, analise a seguinte transação financeira e forneça uma análise detalhada:

      ID: ${transaction.id}
      Tipo: ${transaction.type}
      Valor: ${transaction.amount}
      Descrição: ${transaction.description}
      Data: ${transaction.date}
      Status: ${transaction.status}

      Por favor, forneça:

      1. Análise de Risco:
      - Score de risco (0-1)
      - Nível de risco (baixo/médio/alto)
      - Fatores considerados
      - Nível de confiança da análise

      2. Detecção de Fraude:
      - Probabilidade de fraude (0-1)
      - Indicadores identificados
      - Severidade (baixa/média/alta)
      - Nível de confiança da detecção

      3. Recomendações:
      - Ações recomendadas
      - Avisos importantes
      - Informações adicionais relevantes

      4. Detalhes da Análise:
      - Análise por categoria
      - Scores específicos
      - Descrições detalhadas
      - Fatores relevantes
    `;
  }

  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const aiService = new AIService(); 