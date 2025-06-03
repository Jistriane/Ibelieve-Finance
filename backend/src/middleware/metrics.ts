import { Request, Response, NextFunction } from 'express';
import { metricsHelper } from '../config/metrics';

// Middleware de métricas
export const metricsMiddleware = {
  // Coletar métricas de requisição HTTP
  collectHttpMetrics(req: Request, res: Response, next: NextFunction): void {
    // Registrar tempo inicial
    const startTime = process.hrtime();

    // Interceptar fim da requisição
    res.on('finish', () => {
      // Calcular tempo de resposta
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const responseTime = seconds * 1000 + nanoseconds / 1000000;

      // Registrar métricas
      metricsHelper.httpMetricsMiddleware(req, res, responseTime);
    });

    next();
  },

  // Coletar métricas de recursos do sistema
  collectSystemMetrics(req: Request, res: Response, next: NextFunction): void {
    // Registrar conexões ativas
    const activeResources = process.getActiveResourcesInfo().length;
    metricsHelper.updateActiveConnections(activeResources);

    next();
  }
}; 