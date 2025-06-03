export interface Loan {
  id: string;
  amount: number;
  term: number;
  collateral: string;
  status: LoanStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface User {
  id: string;
  address: string;
  loans: Loan[];
  createdAt: Date;
  updatedAt: Date;
}

export type WalletType = 'metamask' | 'subwallet';

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  provider: any | null;
  error: string | null;
}

export interface LoanRequest {
  amount: number;
  term: number;
  collateral: string;
}

export interface LoanResponse {
  success: boolean;
  data?: Loan;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ThemeState {
  mode: 'light' | 'dark';
}

export interface NotificationOptions {
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  autoClose?: number;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  theme?: 'light' | 'dark' | 'colored';
}

export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  options?: NotificationOptions;
}

export interface AppState {
  theme: ThemeState;
  notification: NotificationState | null;
  wallet: WalletState;
  user: {
    address: string | null;
    loans: Loan[];
  } | null;
  loading: boolean;
} 