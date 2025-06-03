interface Metric {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: number;
}

export class MetricsService {
  private static instance: MetricsService;
  private metrics: Metric[] = [];
  private readonly maxMetrics: number = 10000;

  private constructor() {}

  static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  private createMetric(
    name: string,
    value: number,
    tags: Record<string, string> = {}
  ): Metric {
    return {
      name,
      value,
      tags,
      timestamp: Date.now(),
    };
  }

  private addMetric(metric: Metric) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Em produção, você pode querer enviar as métricas para um serviço externo
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(metric);
    }
  }

  private sendToExternalService(metric: Metric) {
    // TODO: Implementar integração com serviço de métricas externo
    console.log('Métrica enviada para serviço externo:', metric);
  }

  increment(name: string, tags: Record<string, string> = {}) {
    this.addMetric(this.createMetric(name, 1, tags));
  }

  decrement(name: string, tags: Record<string, string> = {}) {
    this.addMetric(this.createMetric(name, -1, tags));
  }

  gauge(name: string, value: number, tags: Record<string, string> = {}) {
    this.addMetric(this.createMetric(name, value, tags));
  }

  timing(name: string, duration: number, tags: Record<string, string> = {}) {
    this.addMetric(this.createMetric(name, duration, tags));
  }

  getMetrics(): Metric[] {
    return [...this.metrics];
  }

  clearMetrics() {
    this.metrics = [];
  }

  // Métodos específicos para métricas de negócio
  trackLoanRequest(amount: number, term: number, status: string) {
    this.increment('loan.request', {
      amount: amount.toString(),
      term: term.toString(),
      status,
    });
  }

  trackWalletConnection(walletType: string, success: boolean) {
    this.increment('wallet.connection', {
      type: walletType,
      success: success.toString(),
    });
  }

  trackZKProofGeneration(duration: number, success: boolean) {
    this.timing('zkproof.generation', duration, {
      success: success.toString(),
    });
  }

  trackRiskAnalysis(duration: number, riskScore: number) {
    this.timing('risk.analysis', duration, {
      riskScore: riskScore.toString(),
    });
  }
} 