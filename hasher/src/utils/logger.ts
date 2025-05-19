import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

// Configuração do formato de log
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Configuração do logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'hasher-api' },
  transports: [
    // Log no console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Log em arquivo
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Log no Elasticsearch
    new ElasticsearchTransport({
      level: 'info',
      index: 'hasher-logs',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
        auth: {
          username: process.env.ELASTICSEARCH_USER || 'elastic',
          password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
        }
      },
      indexPrefix: 'hasher-logs',
      indexSuffixPattern: 'YYYY.MM.DD',
      ensureIndexTemplate: true,
      indexTemplate: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1
        },
        mappings: {
          properties: {
            timestamp: { type: 'date' },
            level: { type: 'keyword' },
            message: { type: 'text' },
            service: { type: 'keyword' },
            metadata: { type: 'object' }
          }
        }
      }
    })
  ]
});

// Função para log de auditoria
export const auditLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'hasher-audit' },
  transports: [
    new ElasticsearchTransport({
      level: 'info',
      index: 'hasher-audit',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
        auth: {
          username: process.env.ELASTICSEARCH_USER || 'elastic',
          password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
        }
      },
      indexPrefix: 'hasher-audit',
      indexSuffixPattern: 'YYYY.MM.DD',
      ensureIndexTemplate: true,
      indexTemplate: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1
        },
        mappings: {
          properties: {
            timestamp: { type: 'date' },
            action: { type: 'keyword' },
            user: { type: 'keyword' },
            resource: { type: 'keyword' },
            status: { type: 'keyword' },
            metadata: { type: 'object' }
          }
        }
      }
    })
  ]
});

// Adiciona um stream para o Morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
}; 