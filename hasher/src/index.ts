import express from 'express';
import compression from 'compression';
import { register } from './utils/metrics';
import { logger } from './utils/logger';
import { apiLimiter } from './utils/security';
import routes from './routes';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(compression());
app.use(apiLimiter);

// Rotas
app.use('/api', routes);

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Erro ao obter métricas:', error);
    res.status(500).end();
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(port, () => {
  logger.info(`Servidor rodando na porta ${port}`);
}); 