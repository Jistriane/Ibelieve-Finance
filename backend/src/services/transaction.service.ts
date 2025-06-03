import { Transaction, ITransaction } from '../models/transaction.model';
import { Logger } from '../utils/logger';
import { Cache } from '../utils/cache';

class TransactionService {
  private logger: Logger;
  private cache: Cache;

  constructor() {
    this.logger = new Logger({
      ENABLED: true,
      LEVEL: 'info',
      FILE_PATH: './logs/transaction.log',
    });
    this.cache = new Cache({
      ENABLED: true,
      TTL: 300, // 5 minutos
      MAX_SIZE: 1000,
    });
  }

  public async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      // Verifica cache
      const cacheKey = `transaction:${id}`;
      const cachedTransaction = this.cache.get<ITransaction>(cacheKey);
      if (cachedTransaction) {
        return new Transaction(cachedTransaction);
      }

      // TODO: Implementar busca no banco de dados
      // Por enquanto, retorna uma transação mock para desenvolvimento
      const mockTransaction = new Transaction({
        id,
        userId: 'user123',
        type: 'payment',
        amount: 100.00,
        description: 'Pagamento de teste',
        date: new Date(),
        status: 'success',
        metadata: {
          location: 'São Paulo',
          device: 'Desktop',
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Armazena no cache
      this.cache.set(cacheKey, mockTransaction.toJSON());

      return mockTransaction;
    } catch (error) {
      this.logger.error('Erro ao buscar transação:', error);
      return null;
    }
  }

  public async createTransaction(data: Omit<ITransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    try {
      const now = new Date();
      const transaction = new Transaction({
        ...data,
        id: this.generateTransactionId(),
        createdAt: now,
        updatedAt: now,
      });

      // TODO: Implementar persistência no banco de dados

      // Armazena no cache
      const cacheKey = `transaction:${transaction.id}`;
      this.cache.set(cacheKey, transaction.toJSON());

      this.logger.info('Transação criada com sucesso', {
        transactionId: transaction.id,
        userId: transaction.userId,
        type: transaction.type,
      });

      return transaction;
    } catch (error) {
      this.logger.error('Erro ao criar transação:', error);
      throw new Error('Falha ao criar transação');
    }
  }

  public async updateTransaction(id: string, data: Partial<ITransaction>): Promise<Transaction | null> {
    try {
      const transaction = await this.getTransactionById(id);
      if (!transaction) {
        return null;
      }

      // Atualiza os campos
      Object.assign(transaction, {
        ...data,
        updatedAt: new Date(),
      });

      // TODO: Implementar atualização no banco de dados

      // Atualiza o cache
      const cacheKey = `transaction:${id}`;
      this.cache.set(cacheKey, transaction.toJSON());

      this.logger.info('Transação atualizada com sucesso', {
        transactionId: id,
        updatedFields: Object.keys(data),
      });

      return transaction;
    } catch (error) {
      this.logger.error('Erro ao atualizar transação:', error);
      throw new Error('Falha ao atualizar transação');
    }
  }

  public async deleteTransaction(id: string): Promise<boolean> {
    try {
      // TODO: Implementar remoção no banco de dados

      // Remove do cache
      const cacheKey = `transaction:${id}`;
      this.cache.delete(cacheKey);

      this.logger.info('Transação removida com sucesso', {
        transactionId: id,
      });

      return true;
    } catch (error) {
      this.logger.error('Erro ao remover transação:', error);
      throw new Error('Falha ao remover transação');
    }
  }

  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const transactionService = new TransactionService(); 