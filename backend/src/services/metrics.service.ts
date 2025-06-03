import client from 'prom-client';
import { environment } from '../config/environment';

// Criar registro personalizado
const register = new client.Registry();

// Adicionar métricas padrão
client.collectDefaultMetrics({ register });

// Métricas personalizadas
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const transactionAnalysisCounter = new client.Counter({
  name: 'transaction_analysis_total',
  help: 'Total de análises de transações realizadas',
  labelNames: ['status', 'risk_level']
});

export const fraudDetectionGauge = new client.Gauge({
  name: 'fraud_detection_score',
  help: 'Score de detecção de fraude',
  labelNames: ['transaction_id']
});

export const cacheHitCounter = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total de hits no cache',
  labelNames: ['cache_type']
});

export const cacheMissCounter = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total de misses no cache',
  labelNames: ['cache_type']
});

// Registrar métricas personalizadas
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(transactionAnalysisCounter);
register.registerMetric(fraudDetectionGauge);
register.registerMetric(cacheHitCounter);
register.registerMetric(cacheMissCounter);

// Middleware para coletar métricas de duração de requisição
export const metricsMiddleware = async (req: any, res: any, next: any): Promise<void> => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration / 1000); // Converter para segundos
  });
  
  next();
};

// Endpoint para expor métricas
export const getMetrics = async (): Promise<string> => {
  return register.metrics();
}; 