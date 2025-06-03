import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  useTheme,
  alpha,
  Paper,
  Grid,
  Tooltip,
  IconButton
} from '@mui/material';
import { Info, Send, AttachMoney } from '@mui/icons-material';

interface LoanFormProps {
  onSubmit: (amount: number, term: number) => Promise<void>;
  isLoading: boolean;
}

const LoanForm: React.FC<LoanFormProps> = ({ onSubmit, isLoading }) => {
  const [amount, setAmount] = useState<string>('');
  const [term, setTerm] = useState<string>('');
  const [errors, setErrors] = useState<{ amount?: string; term?: string }>({});
  const theme = useTheme();

  const validateForm = () => {
    const newErrors: { amount?: string; term?: string } = {};
    const amountNum = parseFloat(amount);
    const termNum = parseInt(term);

    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Valor inválido';
    }
    if (!term || isNaN(termNum) || termNum <= 0) {
      newErrors.term = 'Prazo inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(parseFloat(amount), parseInt(term));
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 4,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        },
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{
          color: theme.palette.primary.main,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <AttachMoney />
        Solicitar Empréstimo
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Valor do Empréstimo"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{
                startAdornment: (
                  <Typography
                    sx={{
                      color: theme.palette.text.secondary,
                      mr: 1,
                    }}
                  >
                    R$
                  </Typography>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Prazo (meses)"
              type="number"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              error={!!errors.term}
              helperText={errors.term}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
              sx={{
                mt: 2,
                py: 1.5,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
                '&.Mui-disabled': {
                  background: alpha(theme.palette.primary.main, 0.3),
                },
              }}
            >
              {isLoading ? 'Processando...' : 'Solicitar Empréstimo'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default LoanForm; 