import client from 'prom-client';
import { config } from './config';

// Configuração do registro
const register = new client.Registry();

// Configurar métricas padrão
client.collectDefaultMetrics({
  prefix: config.metrics.prefix,
  register
});

// Métricas personalizadas
export const metrics = {
  // Contador de requisições HTTP
  httpRequestsTotal: new client.Counter({
    name: `${config.metrics.prefix}http_requests_total`,
    help: 'Total de requisições HTTP',
    labelNames: ['method', 'path', 'status']
  }),

  // Histograma de duração das requisições
  httpRequestDurationSeconds: new client.Histogram({
    name: `${config.metrics.prefix}http_request_duration_seconds`,
    help: 'Duração das requisições HTTP em segundos',
    labelNames: ['method', 'path', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5]
  }),

  // Contador de erros
  errorsTotal: new client.Counter({
    name: `${config.metrics.prefix}errors_total`,
    help: 'Total de erros',
    labelNames: ['type', 'message']
  }),

  // Gauge de conexões ativas
  activeConnections: new client.Gauge({
    name: `${config.metrics.prefix}active_connections`,
    help: 'Número de conexões ativas'
  }),

  // Gauge de uso de memória
  memoryUsage: new client.Gauge({
    name: `${config.metrics.prefix}memory_usage_bytes`,
    help: 'Uso de memória em bytes',
    collect(): void {
      this.set(process.memoryUsage().heapUsed);
    }
  }),

  // Gauge de uso de CPU
  cpuUsage: new client.Gauge({
    name: `${config.metrics.prefix}cpu_usage_percentage`,
    help: 'Uso de CPU em porcentagem',
    async collect(): Promise<void> {
      const startUsage = process.cpuUsage();
      await new Promise(resolve => setTimeout(resolve, 100));
      const endUsage = process.cpuUsage(startUsage);
      const totalUsage = (endUsage.user + endUsage.system) / 1000000; // Converter para segundos
      this.set(totalUsage * 100);
    }
  })
};

// Registrar métricas personalizadas
Object.values(metrics).forEach(metric => register.registerMetric(metric));

// Funções auxiliares
export const metricsHelper = {
  // Obter todas as métricas
  async getMetrics(): Promise<string> {
    return await register.metrics();
  },

  // Middleware para métricas de requisição HTTP
  httpMetricsMiddleware(req: {
    method: string;
    path: string;
  }, res: {
    statusCode: number;
  }, responseTime: number): void {
    const labels = {
      method: req.method,
      path: req.path,
      status: res.statusCode
    };

    metrics.httpRequestsTotal.inc(labels);
    metrics.httpRequestDurationSeconds.observe(labels, responseTime / 1000);
  },

  // Registrar erro
  recordError(type: string, message: string): void {
    metrics.errorsTotal.inc({ type, message });
  },

  // Atualizar conexões ativas
  updateActiveConnections(count: number): void {
    metrics.activeConnections.set(count);
  }
}; 