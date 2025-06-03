import { toast, ToastOptions } from 'react-toastify';

export class NotificationService {
  private static defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'colored',
    style: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: '14px',
      borderRadius: '8px',
    },
  };

  static success(message: string, options?: ToastOptions) {
    toast.success(message, {
      ...this.defaultOptions,
      ...options,
    });
  }

  static error(message: string, options?: ToastOptions) {
    toast.error(message, {
      ...this.defaultOptions,
      ...options,
    });
  }

  static warning(message: string, options?: ToastOptions) {
    toast.warning(message, {
      ...this.defaultOptions,
      ...options,
    });
  }

  static info(message: string, options?: ToastOptions) {
    toast.info(message, {
      ...this.defaultOptions,
      ...options,
    });
  }

  static promise<T>(
    promise: Promise<T>,
    {
      pending,
      success,
      error,
    }: {
      pending: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ) {
    return toast.promise(promise, {
      pending,
      success,
      error,
      ...this.defaultOptions,
      ...options,
    });
  }

  // Métodos específicos para notificações de carteira
  static walletConnected(walletType: string) {
    this.success(`Carteira ${walletType} conectada com sucesso!`);
  }

  static walletDisconnected() {
    this.info('Carteira desconectada.');
  }

  static walletError(error: string) {
    this.error(`Erro na carteira: ${error}`);
  }

  // Métodos específicos para notificações de empréstimo
  static loanRequested() {
    this.info('Solicitação de empréstimo enviada. Aguarde a confirmação.');
  }

  static loanApproved() {
    this.success('Empréstimo aprovado com sucesso!');
  }

  static loanRejected(reason: string) {
    this.error(`Empréstimo rejeitado: ${reason}`);
  }

  // Métodos específicos para notificações de ZKProof
  static proofGenerated() {
    this.success('Prova ZK gerada com sucesso!');
  }

  static proofError(error: string) {
    this.error(`Erro ao gerar prova ZK: ${error}`);
  }

  // Métodos específicos para notificações de IA
  static analysisComplete() {
    this.success('Análise de risco concluída!');
  }

  static analysisError(error: string) {
    this.error(`Erro na análise de risco: ${error}`);
  }
} 