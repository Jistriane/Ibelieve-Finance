import axios from 'axios';

interface RiskAnalysisParams {
  address: string;
  amount: number;
  proof: any;
}

interface RiskAnalysisResult {
  approved: boolean;
  riskScore: number;
  reason: string;
}

interface FraudDetectionResult {
  isFraudulent: boolean;
  confidence: number;
  reason: string;
}

interface PaymentMonitoringResult {
  isPaymentOnTime: boolean;
  daysLate: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export class OllamaService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_OLLAMA_API_URL || 'http://localhost:11434';
  }

  async analyzeRisk(params: RiskAnalysisParams): Promise<RiskAnalysisResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: 'gemma',
        prompt: `Analise o risco para o endereço ${params.address} solicitando empréstimo de ${params.amount}. 
                Considere a prova ZK fornecida e o histórico de transações.
                Retorne apenas um JSON com os campos: approved (boolean), riskScore (number), reason (string)`,
        stream: false
      });

      return JSON.parse(response.data.response);
    } catch (error) {
      console.error('Erro na análise de risco:', error);
      throw error;
    }
  }

  async detectFraud(address: string): Promise<FraudDetectionResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: 'gemma',
        prompt: `Analise o endereço ${address} para detectar possíveis fraudes.
                Considere padrões de comportamento suspeito e histórico de transações.
                Retorne apenas um JSON com os campos: isFraudulent (boolean), confidence (number), reason (string)`,
        stream: false
      });

      return JSON.parse(response.data.response);
    } catch (error) {
      console.error('Erro na detecção de fraude:', error);
      throw error;
    }
  }

  async monitorPayment(address: string): Promise<PaymentMonitoringResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: 'gemma',
        prompt: `Monitore os pagamentos do endereço ${address}.
                Analise o histórico de pagamentos e pontualidade.
                Retorne apenas um JSON com os campos: isPaymentOnTime (boolean), daysLate (number), riskLevel (string)`,
        stream: false
      });

      return JSON.parse(response.data.response);
    } catch (error) {
      console.error('Erro no monitoramento de pagamento:', error);
      throw error;
    }
  }
} 