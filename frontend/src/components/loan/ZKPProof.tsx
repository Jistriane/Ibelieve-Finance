import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import axios from 'axios';

interface ZKPProofProps {
  walletAddress: string;
  amount: string;
  term: string;
}

export const ZKPProof: React.FC<ZKPProofProps> = ({
  walletAddress,
  amount,
  term,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proof, setProof] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  const generateProof = async () => {
    setLoading(true);
    setError(null);
    setProof(null);
    setVerificationStatus(null);

    try {
      const response = await axios.post('/api/zkp/generate', {
        walletAddress,
        amount,
        term,
      });

      if (response.data.success) {
        setProof(response.data.proof);
      } else {
        setError('Erro ao gerar prova ZKP');
      }
    } catch (err) {
      setError('Erro ao gerar prova ZKP');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyProof = async () => {
    if (!proof) return;

    setLoading(true);
    setError(null);
    setVerificationStatus(null);

    try {
      const response = await axios.post('/api/zkp/verify', {
        proof,
        walletAddress,
      });

      if (response.data.success) {
        setVerificationStatus('Prova verificada com sucesso!');
      } else {
        setError('Erro ao verificar prova ZKP');
      }
    } catch (err) {
      setError('Erro ao verificar prova ZKP');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Prova de Conhecimento Zero (ZKP)
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body1" gutterBottom>
          Gere uma prova ZKP para validar sua solicitação de empréstimo sem revelar dados sensíveis.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {verificationStatus && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {verificationStatus}
          </Alert>
        )}

        {proof && (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={proof}
            label="Prova ZKP"
            variant="outlined"
            sx={{ mt: 2 }}
            InputProps={{
              readOnly: true,
            }}
          />
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={generateProof}
            disabled={loading || !walletAddress || !amount || !term}
          >
            {loading ? <CircularProgress size={24} /> : 'Gerar Prova'}
          </Button>

          {proof && (
            <Button
              variant="outlined"
              color="primary"
              onClick={verifyProof}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Verificar Prova'}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}; 