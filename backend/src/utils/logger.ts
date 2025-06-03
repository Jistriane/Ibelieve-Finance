import winston from 'winston';
import { format } from 'winston';

interface LoggerConfig {
  ENABLED: boolean;
  LEVEL: string;
  FILE_PATH: string;
}

export class Logger {
  private logger: winston.Logger;
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;

    const logFormat = format.combine(
      format.timestamp(),
      format.json(),
      format.prettyPrint()
    );

    this.logger = winston.createLogger({
      level: this.config.LEVEL,
      format: logFormat,
      transports: [
        // Console transport
        new winston.transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          ),
        }),
      ],
    });

    // Adiciona o transporte de arquivo se estiver habilitado
    if (this.config.ENABLED && this.config.FILE_PATH) {
      this.logger.add(
        new winston.transports.File({
          filename: this.config.FILE_PATH,
          format: logFormat,
        })
      );
    }
  }

  public info(message: string, meta?: any): void {
    if (this.config.ENABLED) {
      this.logger.info(message, meta);
    }
  }

  public error(message: string, error?: any): void {
    if (this.config.ENABLED) {
      this.logger.error(message, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : error,
      });
    }
  }

  public warn(message: string, meta?: any): void {
    if (this.config.ENABLED) {
      this.logger.warn(message, meta);
    }
  }

  public debug(message: string, meta?: any): void {
    if (this.config.ENABLED) {
      this.logger.debug(message, meta);
    }
  }

  public async query(options: winston.QueryOptions): Promise<winston.QueryResults> {
    return new Promise((resolve, reject) => {
      this.logger.query(options, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  public profile(id: string, meta?: any): void {
    if (this.config.ENABLED) {
      this.logger.profile(id, meta);
    }
  }
} 