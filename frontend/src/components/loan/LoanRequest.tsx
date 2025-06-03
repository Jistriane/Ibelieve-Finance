import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useSelector } from 'react-redux';
import axios from 'axios';

interface LoanRequestProps {
  walletAddress: string;
}

const validationSchema = Yup.object({
  amount: Yup.number()
    .required('Valor é obrigatório')
    .min(0.01, 'Valor mínimo é 0.01')
    .max(1000000, 'Valor máximo é 1.000.000'),
  term: Yup.number()
    .required('Prazo é obrigatório')
    .min(1, 'Prazo mínimo é 1 mês')
    .max(60, 'Prazo máximo é 60 meses'),
});

export const LoanRequest: React.FC<LoanRequestProps> = ({ walletAddress }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      amount: '',
      term: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        // 1. Análise de risco via IA local
        const riskResponse = await axios.post('http://localhost:11434/api/generate', {
          model: 'mistral',
          prompt: `Avalie o risco para a carteira ${walletAddress} com base nas transações. Retorne apenas "Risco baixo" ou "Risco alto".`,
        });

        if (riskResponse.data.response.toLowerCase().includes('alto')) {
          setError('Empréstimo negado por risco alto');
          return;
        }

        // 2. Geração de prova ZKP
        const zkpResponse = await axios.post('/api/zkp/generate', {
          walletAddress,
          amount: values.amount,
          term: values.term,
        });

        if (!zkpResponse.data.success) {
          setError('Erro ao gerar prova ZKP');
          return;
        }

        // 3. Registro na blockchain
        const blockchainResponse = await axios.post('/api/blockchain/verify-assets', {
          proof: zkpResponse.data.proof,
          walletAddress,
        });

        if (!blockchainResponse.data.success) {
          setError('Erro ao registrar na blockchain');
          return;
        }

        setSuccess('Empréstimo solicitado com sucesso!');
        formik.resetForm();
      } catch (err) {
        setError('Erro ao processar solicitação');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Solicitar Empréstimo
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            id="amount"
            name="amount"
            label="Valor do Empréstimo"
            type="number"
            value={formik.values.amount}
            onChange={formik.handleChange}
            error={formik.touched.amount && Boolean(formik.errors.amount)}
            helperText={formik.touched.amount && formik.errors.amount}
          />

          <TextField
            fullWidth
            id="term"
            name="term"
            label="Prazo (meses)"
            type="number"
            value={formik.values.term}
            onChange={formik.handleChange}
            error={formik.touched.term && Boolean(formik.errors.term)}
            helperText={formik.touched.term && formik.errors.term}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !formik.isValid}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Solicitar Empréstimo'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}; 