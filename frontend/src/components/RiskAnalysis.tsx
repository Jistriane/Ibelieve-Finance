import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';

interface RiskResult {
  score: number;
  level: 'BAIXO' | 'MÉDIO' | 'ALTO';
  details: {
    creditScore: number;
    transactionHistory: number;
    collateralValue: number;
  };
}

interface RiskAnalysisProps {
  result: RiskResult | null;
  loanAmount: string;
  walletBalance: string;
  isAnalyzing: boolean;
}

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({
  result,
  loanAmount,
  walletBalance,
  isAnalyzing,
}) => {
  if (isAnalyzing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!result) {
    return null;
  }

  const getRiskColor = (level: RiskResult['level']) => {
    switch (level) {
      case 'BAIXO':
        return 'success.main';
      case 'MÉDIO':
        return 'warning.main';
      case 'ALTO':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Análise de Risco
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Score de Risco: {result.score}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: getRiskColor(result.level) }}
        >
          Nível de Risco: {result.level}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Detalhes:
        </Typography>
        <Typography variant="body2">
          • Score de Crédito: {result.details.creditScore}
        </Typography>
        <Typography variant="body2">
          • Histórico de Transações: {result.details.transactionHistory}
        </Typography>
        <Typography variant="body2">
          • Valor do Colateral: {result.details.collateralValue}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Informações do Empréstimo:
        </Typography>
        <Typography variant="body2">
          • Valor Solicitado: {loanAmount} ETH
        </Typography>
        <Typography variant="body2">
          • Saldo da Carteira: {walletBalance} ETH
        </Typography>
      </Box>

      {result.level === 'ALTO' && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Atenção: Este empréstimo apresenta um alto nível de risco. Considere revisar os termos ou fornecer colateral adicional.
        </Alert>
      )}
    </Box>
  );
};

export default RiskAnalysis; 