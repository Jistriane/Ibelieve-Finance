import axios from 'axios';

interface RiskAnalysisData {
  income: number;
  expenses: number;
  creditScore: number;
  loanAmount: number;
  loanTerm: number;
}

interface RiskAnalysisResult {
  riskScore: number;
  recommendation: string;
  details: string[];
}

export class OllamaService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_OLLAMA_API_URL || 'http://localhost:11434';
  }

  async analyzeRisk(data: RiskAnalysisData): Promise<RiskAnalysisResult> {
    try {
      const prompt = this.buildRiskAnalysisPrompt(data);
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: 'llama2',
        prompt,
        stream: false,
      });

      return this.parseRiskAnalysisResponse(response.data);
    } catch (error) {
      console.error('Erro na análise de risco:', error);
      throw new Error('Falha ao analisar risco. Tente novamente mais tarde.');
    }
  }

  private buildRiskAnalysisPrompt(data: RiskAnalysisData): string {
    return `
      Analise o seguinte cenário de empréstimo:
      - Renda mensal: R$ ${data.income}
      - Despesas mensais: R$ ${data.expenses}
      - Score de crédito: ${data.creditScore}
      - Valor do empréstimo: R$ ${data.loanAmount}
      - Prazo do empréstimo: ${data.loanTerm} meses

      Forneça uma análise detalhada incluindo:
      1. Score de risco (0-100)
      2. Recomendação (Aprovado/Reprovado)
      3. Detalhes da análise
    `;
  }

  private parseRiskAnalysisResponse(response: any): RiskAnalysisResult {
    try {
      const content = response.response;
      const lines = content.split('\n').filter((line: string) => line.trim());

      const riskScore = this.extractRiskScore(lines);
      const recommendation = this.extractRecommendation(lines);
      const details = this.extractDetails(lines);

      return {
        riskScore,
        recommendation,
        details,
      };
    } catch (error) {
      console.error('Erro ao processar resposta do Ollama:', error);
      throw new Error('Falha ao processar análise de risco.');
    }
  }

  private extractRiskScore(lines: string[]): number {
    const scoreLine = lines.find(line => line.includes('Score de risco'));
    if (!scoreLine) return 50; // Score padrão em caso de erro

    const scoreMatch = scoreLine.match(/\d+/);
    return scoreMatch ? parseInt(scoreMatch[0]) : 50;
  }

  private extractRecommendation(lines: string[]): string {
    const recommendationLine = lines.find(line => 
      line.includes('Recomendação') || line.includes('Aprovado') || line.includes('Reprovado')
    );
    return recommendationLine || 'Análise inconclusiva';
  }

  private extractDetails(lines: string[]): string[] {
    return lines.filter(line => 
      !line.includes('Score de risco') && 
      !line.includes('Recomendação') &&
      line.trim().length > 0
    );
  }
} 