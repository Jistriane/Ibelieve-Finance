import axios from 'axios';

export interface Metric {
  name: string;
  value: number;
  timestamp: string;
  labels?: Record<string, string>;
}

export class MetricsService {
  private static instance: MetricsService;
  private readonly apiUrl: string;

  private constructor() {
    this.apiUrl = process.env.REACT_APP_METRICS_API_URL || 'http://localhost:3001/api/metrics';
  }

  static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  private async sendMetric(metric: Metric): Promise<void> {
    try {
      await axios.post(this.apiUrl, metric);
    } catch (error) {
      console.error('Erro ao enviar métrica:', error);
    }
  }

  async trackWalletConnection(walletType: string, duration: number): Promise<void> {
    await this.sendMetric({
      name: 'wallet_connection_duration',
      value: duration,
      timestamp: new Date().toISOString(),
      labels: {
        walletType
      }
    });
  }

  async trackProofGeneration(duration: number, success: boolean): Promise<void> {
    await this.sendMetric({
      name: 'proof_generation_duration',
      value: duration,
      timestamp: new Date().toISOString(),
      labels: {
        success: success.toString()
      }
    });
  }

  async trackProofRegistration(duration: number, success: boolean): Promise<void> {
    await this.sendMetric({
      name: 'proof_registration_duration',
      value: duration,
      timestamp: new Date().toISOString(),
      labels: {
        success: success.toString()
      }
    });
  }

  async trackRiskAnalysis(duration: number, riskScore: number): Promise<void> {
    await this.sendMetric({
      name: 'risk_analysis_duration',
      value: duration,
      timestamp: new Date().toISOString(),
      labels: {
        riskScore: riskScore.toString()
      }
    });
  }

  async trackError(errorType: string): Promise<void> {
    await this.sendMetric({
      name: 'error_count',
      value: 1,
      timestamp: new Date().toISOString(),
      labels: {
        errorType
      }
    });
  }

  async trackTransactionGas(gasUsed: number, success: boolean): Promise<void> {
    await this.sendMetric({
      name: 'transaction_gas_used',
      value: gasUsed,
      timestamp: new Date().toISOString(),
      labels: {
        success: success.toString()
      }
    });
  }
} 