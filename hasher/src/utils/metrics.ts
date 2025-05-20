import { Registry, Counter, Histogram, Gauge } from 'prom-client';

const register = new Registry();

// Métricas HTTP
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'path', 'status'],
  registers: [register]
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

export const httpRequestErrors = new Counter({
  name: 'http_request_errors_total',
  help: 'Total de erros em requisições HTTP',
  labelNames: ['method', 'path', 'error_type'],
  registers: [register]
});

// Métricas ZKP
export const zkpProofGeneration = new Counter({
  name: 'zkp_proof_generation_total',
  help: 'Total de provas ZKP geradas',
  labelNames: ['type', 'status'],
  registers: [register]
});

export const zkpProofVerification = new Counter({
  name: 'zkp_proof_verification_total',
  help: 'Total de provas ZKP verificadas',
  labelNames: ['type', 'status'],
  registers: [register]
});

export const zkpProofGenerationDuration = new Histogram({
  name: 'zkp_proof_generation_duration_seconds',
  help: 'Duração da geração de provas ZKP em segundos',
  labelNames: ['type'],
  buckets: [1, 5, 10, 30, 60],
  registers: [register]
});

// Métricas Open Finance
export const openFinanceRequests = new Counter({
  name: 'openfinance_requests_total',
  help: 'Total de requisições ao Open Finance',
  labelNames: ['endpoint', 'status'],
  registers: [register]
});

export const openFinanceErrors = new Counter({
  name: 'openfinance_errors_total',
  help: 'Total de erros em requisições ao Open Finance',
  labelNames: ['endpoint', 'error_type'],
  registers: [register]
});

export const openFinanceTokenExpirations = new Counter({
  name: 'openfinance_token_expirations_total',
  help: 'Total de tokens do Open Finance expirados',
  registers: [register]
});

// Métricas de Cache
export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total de hits no cache',
  labelNames: ['cache_type'],
  registers: [register]
});

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total de misses no cache',
  labelNames: ['cache_type'],
  registers: [register]
});

export const cacheSize = new Gauge({
  name: 'cache_size_bytes',
  help: 'Tamanho atual do cache em bytes',
  labelNames: ['cache_type'],
  registers: [register]
});

// Métricas do Sistema
export const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Total de usuários ativos',
  registers: [register]
});

export const activeSessions = new Gauge({
  name: 'active_sessions_total',
  help: 'Total de sessões ativas',
  registers: [register]
});

// Métricas de Auditoria
export const auditLogsTotal = new Counter({
  name: 'audit_logs_total',
  help: 'Total de logs de auditoria gerados',
  labelNames: ['event_type', 'status'],
  registers: [register]
});

export const auditLogErrors = new Counter({
  name: 'audit_log_errors_total',
  help: 'Total de erros na geração de logs de auditoria',
  labelNames: ['error_type'],
  registers: [register]
});

// Exportar todas as métricas
export const metrics = {
  httpRequestsTotal,
  httpRequestDuration,
  httpRequestErrors,
  zkpProofGeneration,
  zkpProofVerification,
  zkpProofGenerationDuration,
  openFinanceRequests,
  openFinanceErrors,
  openFinanceTokenExpirations,
  cacheHits,
  cacheMisses,
  cacheSize,
  activeUsers,
  activeSessions,
  auditLogsTotal,
  auditLogErrors
};

// Configuração do registro de métricas
register.setDefaultLabels({
  app: 'hasher-api',
  environment: process.env.NODE_ENV || 'development'
});

export { register }; 