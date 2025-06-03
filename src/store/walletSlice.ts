import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

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

export const connectWallet = createAsyncThunk(
  'wallet/connect',
  async (walletType: 'metamask' | 'subwallet') => {
    let provider;
    
    if (walletType === 'metamask') {
      if (!window.ethereum) {
        throw new Error('MetaMask não está instalado');
      }
      provider = new ethers.providers.Web3Provider(window.ethereum);
    } else if (walletType === 'subwallet') {
      if (!window.subwallet) {
        throw new Error('SubWallet não está instalado');
      }
      provider = new ethers.providers.Web3Provider(window.subwallet);
    }

    if (!provider) {
      throw new Error('Provedor não encontrado');
    }

    const accounts = await provider.send('eth_requestAccounts', []);
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(accounts[0]);

    return {
      address: accounts[0],
      chainId: network.chainId,
      balance: ethers.utils.formatEther(balance),
    };
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    disconnectWallet: (state) => {
      state.address = null;
      state.balance = '0';
      state.chainId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.address = action.payload.address;
        state.chainId = action.payload.chainId;
        state.balance = action.payload.balance;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.error.message || 'Erro ao conectar carteira';
      });
  },
});

export const { disconnectWallet } = walletSlice.actions;
export default walletSlice.reducer; 