import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  Grid,
} from '@mui/material';
import { VerifiedUser as VerifiedUserIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface ZKProof {
  hash: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  limit?: string;
  riskScore?: number;
  efficiencyScore?: number;
  fraudScore?: number;
}

const ZKVerify: React.FC = () => {
  const { address, balance } = useSelector((state: RootState) => state.wallet);
  const [loading, setLoading] = useState(false);
  const [proof, setProof] = useState<ZKProof | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loanAmount, setLoanAmount] = useState('');

  const generateProof = async () => {
    if (!address) {
      setError('Conecte sua carteira primeiro');
      return;
    }

    if (!loanAmount || isNaN(Number(loanAmount)) || Number(loanAmount) <= 0) {
      setError('Digite um valor de empréstimo válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implementar integração com o serviço de ZK
      // Simulação de geração de prova
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const balanceInEth = parseFloat(balance);
      const requestedAmount = parseFloat(loanAmount);
      const riskScore = Math.min(100, Math.max(0, (balanceInEth / requestedAmount) * 100));
      const efficiencyScore = Math.floor(Math.random() * 100);
      const fraudScore = Math.floor(Math.random() * 20);

      const mockProof: ZKProof = {
        hash: '0x' + Math.random().toString(16).substring(2, 42),
        timestamp: new Date().toISOString(),
        status: riskScore >= 50 ? 'approved' : 'rejected',
        limit: `${Math.min(balanceInEth * 0.8, requestedAmount)} ETH`,
        riskScore,
        efficiencyScore,
        fraudScore,
      };

      setProof(mockProof);
    } catch (err) {
      setError('Erro ao gerar prova zero');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, height: '600px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VerifiedUserIcon color="primary" />
        Prova Zero de Solvência
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Valor do Empréstimo (ETH)"
          type="number"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <VerifiedUserIcon />}
          onClick={generateProof}
          disabled={loading || !address || !loanAmount}
          fullWidth
          size="large"
        >
          {loading ? 'Gerando Prova...' : 'Gerar Prova Zero'}
        </Button>
      </Box>

      {proof && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Alert severity={proof.status === 'approved' ? 'success' : 'warning'} sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Hash da Prova:</Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all', my: 1 }}>
              {proof.hash}
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Data/Hora: {new Date(proof.timestamp).toLocaleString()}
            </Typography>
            {proof.limit && (
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Limite de Crédito: {proof.limit}
              </Typography>
            )}
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Pontuação de Risco
                </Typography>
                <Typography variant="h4" color={proof.riskScore >= 50 ? 'success.main' : 'error.main'}>
                  {proof.riskScore}%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Eficiência ZKP
                </Typography>
                <Typography variant="h4" color="primary">
                  {proof.efficiencyScore}%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Risco de Fraude
                </Typography>
                <Typography variant="h4" color={proof.fraudScore < 10 ? 'success.main' : 'warning.main'}>
                  {proof.fraudScore}%
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default ZKVerify; 