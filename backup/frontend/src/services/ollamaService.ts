import axios from 'axios';

const OLLAMA_API_URL = 'http://localhost:11434/api';
const MODEL_NAME = 'gemma:2b';

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export class OllamaService {
  private static instance: OllamaService;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService();
    }
    return OllamaService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const response = await axios.get(`${OLLAMA_API_URL}/tags`);
      const models = response.data.models;
      const gemmaExists = models.some((model: any) => model.name === MODEL_NAME);
      
      if (!gemmaExists) {
        throw new Error(`Modelo ${MODEL_NAME} não encontrado no Ollama`);
      }
      
      this.isInitialized = true;
      console.log('Ollama Service inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar Ollama Service:', error);
      throw new Error('Falha ao conectar com o Ollama');
    }
  }

  async analyzeFinancialData(data: {
    requestedAmount: number;
    netWorth: number;
    historicalData?: any[];
    riskFactors?: any[];
  }): Promise<{
    analysis: string;
    recommendation: string;
    riskLevel: 'BAIXO' | 'MÉDIO' | 'ALTO';
    confidence: number;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const prompt = this.buildAnalysisPrompt(data);
      const response = await axios.post<OllamaResponse>(`${OLLAMA_API_URL}/generate`, {
        model: MODEL_NAME,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000
        }
      });

      return this.parseAnalysisResponse(response.data.response);
    } catch (error) {
      console.error('Erro ao analisar dados financeiros:', error);
      throw new Error('Falha ao realizar análise financeira');
    }
  }

  private buildAnalysisPrompt(data: any): string {
    return `
      Analise os seguintes dados financeiros e forneça uma recomendação detalhada:
      
      Valor Solicitado: ${data.requestedAmount}
      Patrimônio Líquido: ${data.netWorth}
      ${data.historicalData ? `Dados Históricos: ${JSON.stringify(data.historicalData)}` : ''}
      ${data.riskFactors ? `Fatores de Risco: ${JSON.stringify(data.riskFactors)}` : ''}
      
      Por favor, forneça:
      1. Uma análise detalhada da situação
      2. Uma recomendação clara
      3. Nível de risco (BAIXO, MÉDIO ou ALTO)
      4. Nível de confiança da análise (0-100)
      
      Formate a resposta em JSON com as seguintes chaves:
      {
        "analysis": "análise detalhada",
        "recommendation": "recomendação",
        "riskLevel": "BAIXO|MÉDIO|ALTO",
        "confidence": número
      }
    `;
  }

  private parseAnalysisResponse(response: string): any {
    try {
      // Tenta encontrar um objeto JSON na resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Se não encontrar JSON, retorna uma resposta estruturada
      return {
        analysis: response,
        recommendation: "Não foi possível gerar uma recomendação específica",
        riskLevel: "MÉDIO",
        confidence: 50
      };
    } catch (error) {
      console.error('Erro ao processar resposta do Ollama:', error);
      return {
        analysis: response,
        recommendation: "Erro ao processar análise",
        riskLevel: "MÉDIO",
        confidence: 0
      };
    }
  }
}

export const ollamaService = OllamaService.getInstance(); 