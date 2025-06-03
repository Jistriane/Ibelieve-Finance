import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  address: string;
  provider: string;
  balance: string;
  isConnected: boolean;
}

const initialState: WalletState = {
  address: '',
  provider: '',
  balance: '0',
  isConnected: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWallet: (state, action: PayloadAction<{ address: string; provider: string }>) => {
      state.address = action.payload.address;
      state.provider = action.payload.provider;
      state.isConnected = true;
    },
    setBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    disconnectWallet: (state) => {
      state.address = '';
      state.provider = '';
      state.balance = '0';
      state.isConnected = false;
    },
  },
});

export const { setWallet, setBalance, disconnectWallet } = walletSlice.actions;
export default walletSlice.reducer; 