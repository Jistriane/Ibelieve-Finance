import { toast, ToastOptions } from 'react-toastify';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface Notification {
  type: NotificationType;
  message: string;
  title?: string;
}

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showNotification = (notification: Notification) => {
  const options: ToastOptions = {
    ...defaultOptions,
    position: 'top-right' as const,
  };

  switch (notification.type) {
    case NotificationType.SUCCESS:
      toast.success(notification.message, options);
      break;
    case NotificationType.ERROR:
      toast.error(notification.message, options);
      break;
    case NotificationType.WARNING:
      toast.warning(notification.message, options);
      break;
    case NotificationType.INFO:
      toast.info(notification.message, options);
      break;
  }
};

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  show(notification: Notification): void {
    showNotification(notification);
  }

  showWalletConnected(address: string): void {
    this.show({
      type: NotificationType.SUCCESS,
      message: `Carteira conectada: ${address}`,
      title: 'Conexão Estabelecida'
    });
  }

  showWalletDisconnected(): void {
    this.show({
      type: NotificationType.INFO,
      message: 'Carteira desconectada',
      title: 'Desconexão'
    });
  }

  showProofGenerated(): void {
    this.show({
      type: NotificationType.SUCCESS,
      message: 'Prova ZK gerada com sucesso',
      title: 'Prova Gerada'
    });
  }

  showProofRegistered(): void {
    this.show({
      type: NotificationType.SUCCESS,
      message: 'Prova registrada na blockchain',
      title: 'Prova Registrada'
    });
  }

  showError(message: string): void {
    this.show({
      type: NotificationType.ERROR,
      message,
      title: 'Erro'
    });
  }
} 