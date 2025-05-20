import { Router } from 'express';
import { apiLimiter } from '../utils/security';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

const router = Router();

// Middleware de autenticação
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  // Implementar verificação do token
  next();
};

// Middleware de métricas
const metricsMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.httpRequestsTotal.inc({ method: req.method, path: req.path, status: res.statusCode });
    metrics.httpRequestDuration.observe({ method: req.method, path: req.path, status: res.statusCode }, duration);
    if (res.statusCode >= 400) {
      metrics.httpRequestErrors.inc({ method: req.method, path: req.path, error_type: res.statusCode });
    }
  });
  next();
};

// Aplicar middlewares globais
router.use(metricsMiddleware);
router.use(authMiddleware);

// Rotas da API
router.get('/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Rotas protegidas com rate limiting específico
router.post('/zkp/generate', apiLimiter, async (req, res) => {
  try {
    // Implementar geração de prova ZKP
    metrics.zkpProofGeneration.inc();
    res.json({ status: 'success' });
  } catch (error) {
    logger.error('Erro ao gerar prova ZKP:', error);
    res.status(500).json({ error: 'Erro ao gerar prova' });
  }
});

router.post('/zkp/verify', apiLimiter, async (req, res) => {
  try {
    // Implementar verificação de prova ZKP
    metrics.zkpProofVerification.inc();
    res.json({ status: 'success' });
  } catch (error) {
    logger.error('Erro ao verificar prova ZKP:', error);
    res.status(500).json({ error: 'Erro ao verificar prova' });
  }
});

export default router; 