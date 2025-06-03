import winston from 'winston';
import { config } from './config';

// Formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  config.logging.format === 'json'
    ? winston.format.json()
    : winston.format.simple()
);

// Configuração do logger
export const logger = winston.createLogger({
  level: config.logging.level,
  format: customFormat,
  defaultMeta: { service: 'ibelieve-backend' },
  transports: [
    // Arquivo de log
    new winston.transports.File({
      filename: config.logging.filePath,
      maxsize: parseInt(config.logging.maxSize.replace('m', '000000')), // Converter MB para bytes
      maxFiles: config.logging.maxFiles,
      tailable: true
    }),
    // Console (apenas em desenvolvimento)
    ...(config.env !== 'production'
      ? [new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })]
      : [])
  ]
});

// Interceptar logs não capturados
winston.exceptions.handle(
  new winston.transports.File({
    filename: 'logs/exceptions.log',
    maxsize: 10000000, // 10MB
    maxFiles: 5,
    tailable: true
  })
);

// Interceptar promessas rejeitadas não tratadas
winston.rejections.handle(
  new winston.transports.File({
    filename: 'logs/rejections.log',
    maxsize: 10000000, // 10MB
    maxFiles: 5,
    tailable: true
  })
);

// Funções auxiliares
export const loggerHelper = {
  // Log de informação
  info(message: string, meta?: Record<string, unknown>): void {
    logger.info(message, meta);
  },

  // Log de aviso
  warn(message: string, meta?: Record<string, unknown>): void {
    logger.warn(message, meta);
  },

  // Log de erro
  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    logger.error(message, {
      error: error?.message,
      stack: error?.stack,
      ...meta
    });
  },

  // Log de debug
  debug(message: string, meta?: Record<string, unknown>): void {
    logger.debug(message, meta);
  },

  // Log de requisição HTTP
  httpRequest(req: {
    method: string;
    url: string;
    headers: Record<string, unknown>;
    body?: unknown;
  }): void {
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    });
  },

  // Log de resposta HTTP
  httpResponse(res: {
    statusCode: number;
    body?: unknown;
  }): void {
    logger.info('HTTP Response', {
      statusCode: res.statusCode,
      body: res.body
    });
  }
}; 