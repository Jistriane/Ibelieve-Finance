import axios from 'axios';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export class LogService {
  private static instance: LogService;
  private readonly apiUrl: string;

  private constructor() {
    this.apiUrl = process.env.REACT_APP_LOG_API_URL || 'http://localhost:3001/api/logs';
  }

  static getInstance(): LogService {
    if (!LogService.instance) {
      LogService.instance = new LogService();
    }
    return LogService.instance;
  }

  private async sendLog(entry: LogEntry): Promise<void> {
    try {
      await axios.post(this.apiUrl, entry);
    } catch (error) {
      console.error('Erro ao enviar log:', error);
    }
  }

  async logWalletConnection(address: string, walletType: string): Promise<void> {
    await this.sendLog({
      level: LogLevel.INFO,
      message: 'Carteira conectada',
      timestamp: new Date().toISOString(),
      metadata: {
        address,
        walletType
      }
    });
  }

  async logWalletDisconnection(address: string): Promise<void> {
    await this.sendLog({
      level: LogLevel.INFO,
      message: 'Carteira desconectada',
      timestamp: new Date().toISOString(),
      metadata: {
        address
      }
    });
  }

  async logProofGeneration(address: string, amount: number): Promise<void> {
    await this.sendLog({
      level: LogLevel.INFO,
      message: 'Prova ZK gerada',
      timestamp: new Date().toISOString(),
      metadata: {
        address,
        amount
      }
    });
  }

  async logProofRegistration(proofHash: string, address: string): Promise<void> {
    await this.sendLog({
      level: LogLevel.INFO,
      message: 'Prova registrada na blockchain',
      timestamp: new Date().toISOString(),
      metadata: {
        proofHash,
        address
      }
    });
  }

  async logError(error: Error, context: string): Promise<void> {
    await this.sendLog({
      level: LogLevel.ERROR,
      message: error.message,
      timestamp: new Date().toISOString(),
      metadata: {
        context,
        stack: error.stack
      }
    });
  }

  async logRiskAnalysis(address: string, amount: number, riskScore: number): Promise<void> {
    await this.sendLog({
      level: LogLevel.INFO,
      message: 'Análise de risco realizada',
      timestamp: new Date().toISOString(),
      metadata: {
        address,
        amount,
        riskScore
      }
    });
  }
} 