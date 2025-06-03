import axios from 'axios';
import { environment } from '../config/environment';

interface OllamaResponse {
  response: string;
  context: number[];
}

export class OllamaService {
  private static instance: OllamaService;
  private baseURL: string;
  private model: string;

  private constructor() {
    this.baseURL = environment.OLLAMA_API_URL;
    this.model = environment.MODEL_NAME;
  }

  public static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService();
    }
    return OllamaService.instance;
  }

  private async generatePrompt(transaction: any): string {
    return `Analise a seguinte transação financeira e forneça insights:
      
      Tipo: ${transaction.type}
      Valor: ${transaction.amount}
      Descrição: ${transaction.description}
      Categoria: ${transaction.category}
      Data: ${transaction.date}
      
      Por favor, avalie:
      1. Nível de risco
      2. Probabilidade de fraude
      3. Recomendações
      4. Indicadores importantes
      5. Análise detalhada`;
  }

  public async analyzeTransaction(transaction: any): Promise<{
    riskScore: number;
    fraudProbability: number;
    recommendations: string[];
    indicators: string[];
    analysisDetails: any[];
  }> {
    try {
      const prompt = await this.generatePrompt(transaction);
      
      const response = await axios.post<OllamaResponse>(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt,
        stream: false,
      });

      const analysis = this.parseAIResponse(response.data.response);
      
      return {
        riskScore: analysis.riskScore,
        fraudProbability: analysis.fraudProbability,
        recommendations: analysis.recommendations,
        indicators: analysis.indicators,
        analysisDetails: analysis.details,
      };
    } catch (error) {
      console.error('Erro ao analisar transação com IA:', error);
      throw new Error('Falha na análise de IA');
    }
  }

  private parseAIResponse(response: string): {
    riskScore: number;
    fraudProbability: number;
    recommendations: string[];
    indicators: string[];
    details: any[];
  } {
    // Implementar parser do texto de resposta da IA
    // Este é um exemplo simplificado
    const lines = response.split('\n');
    const analysis = {
      riskScore: 0,
      fraudProbability: 0,
      recommendations: [],
      indicators: [],
      details: [],
    };

    lines.forEach(line => {
      if (line.includes('Risco:')) {
        analysis.riskScore = parseFloat(line.split(':')[1]) || 0;
      } else if (line.includes('Fraude:')) {
        analysis.fraudProbability = parseFloat(line.split(':')[1]) || 0;
      } else if (line.includes('Recomendação:')) {
        analysis.recommendations.push(line.split(':')[1].trim());
      } else if (line.includes('Indicador:')) {
        analysis.indicators.push(line.split(':')[1].trim());
      } else if (line.includes('Detalhe:')) {
        analysis.details.push({
          type: 'análise',
          description: line.split(':')[1].trim(),
          impact: 0.5,
          confidence: 0.8,
        });
      }
    });

    return analysis;
  }
} 