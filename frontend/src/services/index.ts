import { LoanRequest, LoanResponse, ApiResponse, Loan } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const loanService = {
  async requestLoan(data: LoanRequest): Promise<ApiResponse<Loan>> {
    try {
      const response = await fetch(`${API_URL}/loans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao solicitar empréstimo');
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          code: 'LOAN_REQUEST_ERROR',
        },
      };
    }
  },

  async getLoans(): Promise<ApiResponse<Loan[]>> {
    try {
      const response = await fetch(`${API_URL}/loans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao buscar empréstimos');
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          code: 'LOAN_FETCH_ERROR',
        },
      };
    }
  },

  async getLoanById(id: string): Promise<ApiResponse<Loan>> {
    try {
      const response = await fetch(`${API_URL}/loans/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao buscar empréstimo');
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          code: 'LOAN_FETCH_ERROR',
        },
      };
    }
  },
};

export const notificationService = {
  showSuccess(message: string) {
    // Implementar lógica de notificação
    console.log('Success:', message);
  },

  showError(message: string) {
    // Implementar lógica de notificação
    console.error('Error:', message);
  },

  showInfo(message: string) {
    // Implementar lógica de notificação
    console.info('Info:', message);
  },

  showWarning(message: string) {
    // Implementar lógica de notificação
    console.warn('Warning:', message);
  },
};

export const themeService = {
  getTheme(): 'light' | 'dark' {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  },

  setTheme(theme: 'light' | 'dark') {
    localStorage.setItem('theme', theme);
  },
}; 