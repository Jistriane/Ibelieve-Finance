import { Loan, LoanRequest, LoanResponse, ApiResponse } from '../types';
import { NotificationService } from './NotificationService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export class LoanService {
  private static async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao processar a requisição');
    }
    return response.json();
  }

  static async requestLoan(data: LoanRequest): Promise<Loan> {
    try {
      const response = await fetch(`${API_URL}/loans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<Loan>(response);
      
      if (result.success && result.data) {
        NotificationService.loanRequested();
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Erro ao solicitar empréstimo');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      NotificationService.loanRejected(message);
      throw error;
    }
  }

  static async getLoans(): Promise<Loan[]> {
    try {
      const response = await fetch(`${API_URL}/loans`);
      const result = await this.handleResponse<Loan[]>(response);
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Erro ao buscar empréstimos');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      NotificationService.error(`Erro ao buscar empréstimos: ${message}`);
      throw error;
    }
  }

  static async getLoanById(id: string): Promise<Loan> {
    try {
      const response = await fetch(`${API_URL}/loans/${id}`);
      const result = await this.handleResponse<Loan>(response);
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Erro ao buscar empréstimo');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      NotificationService.error(`Erro ao buscar empréstimo: ${message}`);
      throw error;
    }
  }

  static async approveLoan(id: string): Promise<Loan> {
    try {
      const response = await fetch(`${API_URL}/loans/${id}/approve`, {
        method: 'POST',
      });
      const result = await this.handleResponse<Loan>(response);
      
      if (result.success && result.data) {
        NotificationService.loanApproved();
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Erro ao aprovar empréstimo');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      NotificationService.error(`Erro ao aprovar empréstimo: ${message}`);
      throw error;
    }
  }

  static async rejectLoan(id: string, reason: string): Promise<Loan> {
    try {
      const response = await fetch(`${API_URL}/loans/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      const result = await this.handleResponse<Loan>(response);
      
      if (result.success && result.data) {
        NotificationService.loanRejected(reason);
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Erro ao rejeitar empréstimo');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      NotificationService.error(`Erro ao rejeitar empréstimo: ${message}`);
      throw error;
    }
  }
} 