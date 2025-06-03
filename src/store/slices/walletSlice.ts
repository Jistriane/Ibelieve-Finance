import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  address: string;
  type: 'metamask' | 'subwallet' | '';
  balance: number;
  isConnected: boolean;
}

const initialState: WalletState = {
  address: '',
  type: '',
  balance: 0,
  isConnected: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
      state.isConnected = !!action.payload;
    },
    setWalletType: (state, action: PayloadAction<'metamask' | 'subwallet' | ''>) => {
      state.type = action.payload;
    },
    setWalletBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },
    disconnectWallet: (state) => {
      state.address = '';
      state.type = '';
      state.balance = 0;
      state.isConnected = false;
    },
  },
});

export const {
  setWalletAddress,
  setWalletType,
  setWalletBalance,
  disconnectWallet,
} = walletSlice.actions;

export default walletSlice.reducer; 