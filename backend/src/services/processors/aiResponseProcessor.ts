import { Logger } from '../../utils/logger';

export interface RiskAnalysis {
  score: number;
  level: 'low' | 'medium' | 'high';
  factors: string[];
  confidence: number;
}

export interface FraudDetection {
  probability: number;
  indicators: string[];
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface AIRecommendation {
  type: 'action' | 'warning' | 'info';
  message: string;
  priority: number;
  category: string;
}

export interface AnalysisDetails {
  category: string;
  score: number;
  description: string;
  confidence: number;
  factors: string[];
}

export interface ProcessedAIResponse {
  riskAnalysis: RiskAnalysis;
  fraudDetection: FraudDetection;
  recommendations: AIRecommendation[];
  analysisDetails: AnalysisDetails[];
  metadata: {
    modelUsed: string;
    processingTime: number;
    timestamp: number;
  };
}

export class AIResponseProcessor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public processResponse(aiResponse: string, modelInfo: { name: string; processingTime: number }): ProcessedAIResponse {
    try {
      const startTime = Date.now();
      
      // Divide a resposta em seções
      const sections = this.splitIntoSections(aiResponse);
      
      // Processa cada seção
      const riskAnalysis = this.processRiskAnalysis(sections.riskAnalysis);
      const fraudDetection = this.processFraudDetection(sections.fraudDetection);
      const recommendations = this.processRecommendations(sections.recommendations);
      const analysisDetails = this.processAnalysisDetails(sections.details);

      const response: ProcessedAIResponse = {
        riskAnalysis,
        fraudDetection,
        recommendations,
        analysisDetails,
        metadata: {
          modelUsed: modelInfo.name,
          processingTime: modelInfo.processingTime,
          timestamp: startTime
        }
      };

      this.logger.info('Resposta da IA processada com sucesso', {
        processingTime: Date.now() - startTime,
        sections: Object.keys(sections).length
      });

      return response;
    } catch (error) {
      this.logger.error('Erro ao processar resposta da IA', error);
      throw new Error('Falha ao processar resposta da IA');
    }
  }

  private splitIntoSections(response: string): any {
    // Implementação temporária - será melhorada com regex e parsing mais robusto
    return {
      riskAnalysis: response,
      fraudDetection: response,
      recommendations: response,
      details: response
    };
  }

  private processRiskAnalysis(section: string): RiskAnalysis {
    // Implementação temporária
    return {
      score: 0.5,
      level: 'medium',
      factors: ['Fator temporário'],
      confidence: 0.8
    };
  }

  private processFraudDetection(section: string): FraudDetection {
    // Implementação temporária
    return {
      probability: 0.1,
      indicators: ['Indicador temporário'],
      severity: 'low',
      confidence: 0.9
    };
  }

  private processRecommendations(section: string): AIRecommendation[] {
    // Implementação temporária
    return [{
      type: 'info',
      message: 'Recomendação temporária',
      priority: 1,
      category: 'geral'
    }];
  }

  private processAnalysisDetails(section: string): AnalysisDetails[] {
    // Implementação temporária
    return [{
      category: 'geral',
      score: 0.5,
      description: 'Análise temporária',
      confidence: 0.8,
      factors: ['Fator temporário']
    }];
  }
} 