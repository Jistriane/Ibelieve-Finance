import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/walletSlice';
import zkpReducer from './slices/zkpSlice';

// Interface para o estado da carteira
interface WalletState {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

// Estado inicial da carteira
const initialWalletState: WalletState = {
  address: null,
  balance: '0',
  chainId: null,
  isConnecting: false,
  error: null,
};

// Configura e exporta a store
const store = configureStore({
  reducer: {
    wallet: walletReducer,
    zkp: zkpReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Tipos para TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Exporta o store como default e também como named export
export default store;
