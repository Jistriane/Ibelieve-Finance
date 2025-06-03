import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ZkpState {
  proofHash: string;
  loanAmount: number;
  status: 'pending' | 'approved' | 'rejected' | '';
  timestamp: number;
  limit: number;
}

const initialState: ZkpState = {
  proofHash: '',
  loanAmount: 0,
  status: '',
  timestamp: 0,
  limit: 0,
};

const zkpSlice = createSlice({
  name: 'zkp',
  initialState,
  reducers: {
    setProofHash: (state, action: PayloadAction<string>) => {
      state.proofHash = action.payload;
    },
    setLoanAmount: (state, action: PayloadAction<number>) => {
      state.loanAmount = action.payload;
    },
    setLoanStatus: (state, action: PayloadAction<'pending' | 'approved' | 'rejected'>) => {
      state.status = action.payload;
    },
    setTimestamp: (state, action: PayloadAction<number>) => {
      state.timestamp = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    resetZkpState: (state) => {
      state.proofHash = '';
      state.loanAmount = 0;
      state.status = '';
      state.timestamp = 0;
      state.limit = 0;
    },
  },
});

export const {
  setProofHash,
  setLoanAmount,
  setLoanStatus,
  setTimestamp,
  setLimit,
  resetZkpState,
} = zkpSlice.actions;

export default zkpSlice.reducer; 