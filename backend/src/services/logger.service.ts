import winston from 'winston';
import { environment } from '../config/environment';

const logger = winston.createLogger({
  level: environment.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ibelieve-finance' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (environment.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export interface LogMetadata {
  userId?: string;
  transactionId?: string;
  analysisId?: string;
  [key: string]: any;
}

export const logInfo = (message: string, metadata?: LogMetadata) => {
  logger.info(message, metadata);
};

export const logError = (message: string, error: Error, metadata?: LogMetadata) => {
  logger.error(message, {
    ...metadata,
    error: {
      message: error.message,
      stack: error.stack
    }
  });
};

export const logWarning = (message: string, metadata?: LogMetadata) => {
  logger.warn(message, metadata);
};

export const logDebug = (message: string, metadata?: LogMetadata) => {
  logger.debug(message, metadata);
};

export default logger; 