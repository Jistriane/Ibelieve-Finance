import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { environment } from './config/environment';
import routes from './routes';
import { metricsMiddleware, getMetrics } from './services/metrics.service';
import logger from './services/logger.service';

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(cors());
app.use(express.json());

// Middleware de métricas
app.use(metricsMiddleware);

// Endpoint de métricas do Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', 'text/plain');
    const metrics = await getMetrics();
    res.send(metrics);
  } catch (error) {
    logger.error('Erro ao coletar métricas', error as Error);
    res.status(500).send('Erro ao coletar métricas');
  }
});

// Rotas públicas
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rotas da API
app.use('/api', routes);

// Tratamento de erros
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Erro não tratado', err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

// Inicialização do servidor
app.listen(environment.PORT, () => {
  logger.info(`Servidor iniciado na porta ${environment.PORT}`);
}); 