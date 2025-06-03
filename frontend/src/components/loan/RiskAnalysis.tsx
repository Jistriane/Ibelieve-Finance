import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import axios from 'axios';

interface RiskAnalysisProps {
  walletAddress: string;
}

interface RiskData {
  score: number;
  factors: {
    transactionHistory: number;
    balance: number;
    activity: number;
  };
  recommendation: string;
}

export const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ walletAddress }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskData, setRiskData] = useState<RiskData | null>(null);

  useEffect(() => {
    const analyzeRisk = async () => {
      try {
        const response = await axios.post('http://localhost:11434/api/generate', {
          model: 'mistral',
          prompt: `Analise o risco da carteira ${walletAddress} e retorne um JSON com:
            {
              "score": número entre 0 e 100,
              "factors": {
                "transactionHistory": número entre 0 e 100,
                "balance": número entre 0 e 100,
                "activity": número entre 0 e 100
              },
              "recommendation": "texto com recomendação"
            }`,
        });

        const data = JSON.parse(response.data.response);
        setRiskData(data);
      } catch (err) {
        setError('Erro ao analisar risco');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      analyzeRisk();
    }
  }, [walletAddress]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!riskData) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'success.main';
    if (score >= 40) return 'warning.main';
    return 'error.main';
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Análise de Risco
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Score de Risco
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={riskData.score}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(riskData.score),
                },
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {riskData.score}%
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Fatores de Análise
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Histórico de Transações
            </Typography>
            <LinearProgress
              variant="determinate"
              value={riskData.factors.transactionHistory}
              sx={{ mt: 1 }}
            />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Saldo
            </Typography>
            <LinearProgress
              variant="determinate"
              value={riskData.factors.balance}
              sx={{ mt: 1 }}
            />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Atividade
            </Typography>
            <LinearProgress
              variant="determinate"
              value={riskData.factors.activity}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Recomendação
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {riskData.recommendation}
        </Typography>
      </Box>
    </Paper>
  );
}; 