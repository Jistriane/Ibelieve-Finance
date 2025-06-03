import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useWallet } from '../../hooks/useWallet';
import { LoanService } from '../../services/LoanService';
import { NotificationService } from '../../services/NotificationService';

interface LoanFormProps {
  onSuccess?: () => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ onSuccess }) => {
  const { address, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    term: '',
    collateral: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const amount = parseFloat(formData.amount);
    const term = parseInt(formData.term);

    if (!amount || amount <= 0) {
      setError('O valor do empréstimo deve ser maior que zero');
      return false;
    }

    if (!term || term <= 0) {
      setError('O prazo deve ser maior que zero');
      return false;
    }

    if (!formData.collateral) {
      setError('O colateral é obrigatório');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConnected) {
      setError('Conecte sua carteira para solicitar um empréstimo');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await LoanService.requestLoan({
        amount: parseFloat(formData.amount),
        term: parseInt(formData.term),
        collateral: formData.collateral,
      });

      setFormData({
        amount: '',
        term: '',
        collateral: '',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Solicitar Empréstimo
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Valor do Empréstimo"
        name="amount"
        type="number"
        value={formData.amount}
        onChange={handleChange}
        margin="normal"
        required
        disabled={loading}
        InputProps={{
          inputProps: { min: 0, step: 0.01 },
        }}
      />

      <TextField
        fullWidth
        label="Prazo (dias)"
        name="term"
        type="number"
        value={formData.term}
        onChange={handleChange}
        margin="normal"
        required
        disabled={loading}
        InputProps={{
          inputProps: { min: 1 },
        }}
      />

      <TextField
        fullWidth
        label="Colateral"
        name="collateral"
        value={formData.collateral}
        onChange={handleChange}
        margin="normal"
        required
        disabled={loading}
        placeholder="Endereço do token ou NFT"
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading || !isConnected}
        sx={{ mt: 2 }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Solicitar Empréstimo'
        )}
      </Button>

      {!isConnected && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Conecte sua carteira para solicitar um empréstimo
        </Alert>
      )}
    </Box>
  );
};

export default LoanForm; 