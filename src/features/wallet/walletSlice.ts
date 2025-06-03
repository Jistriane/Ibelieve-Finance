import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

const initialState: WalletState = {
  address: null,
  balance: '0',
  chainId: null,
  isConnecting: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
      state.error = null;
    },
    setWalletBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    setChainId: (state, action: PayloadAction<number>) => {
      state.chainId = action.payload;
    },
    setIsConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isConnecting = false;
    },
    disconnectWallet: (state) => {
      state.address = null;
      state.balance = '0';
      state.chainId = null;
      state.error = null;
      state.isConnecting = false;
    },
  },
});

export const {
  setWalletAddress,
  setWalletBalance,
  setChainId,
  setIsConnecting,
  setError,
  disconnectWallet,
} = walletSlice.actions;

export default walletSlice.reducer; 