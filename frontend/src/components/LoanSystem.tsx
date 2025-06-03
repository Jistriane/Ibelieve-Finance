import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import WalletConnect from './WalletConnect';
import LoanRequest from './LoanRequest';
import RiskAnalysis from './RiskAnalysis';
import ZKPVerification from './ZKPVerification';
import { useWallet } from '../hooks/useWallet';
import { useRiskAnalysis } from '../hooks/useRiskAnalysis';
import { useZKP } from '../hooks/useZKP';

const LoanSystem: React.FC = () => {
  const { isConnected, address, connect, disconnect } = useWallet();
  const { analyzeRisk, riskResult, isAnalyzing } = useRiskAnalysis();
  const { generateProof, verifyProof, proofStatus } = useZKP();
  const [loanAmount, setLoanAmount] = useState<string>('');

  const handleLoanRequest = async (amount: string) => {
    setLoanAmount(amount);
    if (address) {
      await analyzeRisk(address);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Sistema de Empréstimos com IA
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <WalletConnect 
          onConnect={connect}
          onDisconnect={disconnect}
          wallet={{ address }}
        />
      </Paper>

      {address && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <LoanRequest 
              onRequest={handleLoanRequest}
              disabled={isAnalyzing}
            />
          </Paper>

          {riskResult && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <RiskAnalysis 
                result={riskResult}
                loanAmount={loanAmount}
                walletBalance={address}
              />
            </Paper>
          )}

          {riskResult?.approved && (
            <Paper sx={{ p: 3 }}>
              <ZKPVerification 
                onGenerateProof={generateProof}
                onVerifyProof={verifyProof}
                status={proofStatus}
              />
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default LoanSystem; 