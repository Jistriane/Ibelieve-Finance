import axios from 'axios';

const OLLAMA_API_URL = process.env.REACT_APP_OLLAMA_API_URL || 'http://localhost:11434';

export interface AIResponse {
  response: string;
  error?: string;
}

export interface RiskAnalysis {
  riskScore: number;
  recommendations: string[];
  confidence: number;
}

export interface ZKPRecommendation {
  proofType: string;
  efficiency: number;
  explanation: string;
}

export interface FraudDetection {
  isFraudulent: boolean;
  confidence: number;
  details: string[];
}

export class AIService {
  private async callGemma(prompt: string): Promise<AIResponse> {
    try {
      const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
        model: 'gemma:2b',
        prompt,
        stream: false
      });
      
      return { response: response.data.response };
    } catch (error) {
      console.error('Erro ao chamar Ollama:', error);
      return { response: '', error: 'Erro ao processar requisição' };
    }
  }

  async analyzeRisk(data: any): Promise<RiskAnalysis> {
    const prompt = `Analise o seguinte perfil financeiro e retorne uma análise de risco em formato JSON:
    ${JSON.stringify(data)}
    Retorne apenas o JSON com os campos: riskScore (0-100), recommendations (array de strings), confidence (0-100)`;

    const response = await this.callGemma(prompt);
    return JSON.parse(response.response);
  }

  async optimizeZKP(userProfile: any): Promise<ZKPRecommendation> {
    const prompt = `Com base no seguinte perfil de usuário, sugira o tipo de prova ZKP mais eficiente:
    ${JSON.stringify(userProfile)}
    Retorne apenas o JSON com os campos: proofType (string), efficiency (0-100), explanation (string)`;

    const response = await this.callGemma(prompt);
    return JSON.parse(response.response);
  }

  async detectFraud(transaction: any): Promise<FraudDetection> {
    const prompt = `Analise a seguinte transação para detectar possíveis fraudes:
    ${JSON.stringify(transaction)}
    Retorne apenas o JSON com os campos: isFraudulent (boolean), confidence (0-100), details (array de strings)`;

    const response = await this.callGemma(prompt);
    return JSON.parse(response.response);
  }

  async getChatbotResponse(question: string): Promise<string> {
    const prompt = `Responda à seguinte pergunta sobre solvência, provas ZKP e crédito de forma simples e clara:
    ${question}`;

    const response = await this.callGemma(prompt);
    return response.response;
  }
}

// Exportando uma instância padrão
export const aiService = new AIService(); 