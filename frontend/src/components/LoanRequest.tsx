import React from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface LoanRequestProps {
  onRequest: (amount: string) => void;
  disabled?: boolean;
}

const validationSchema = Yup.object({
  amount: Yup.string()
    .required('O valor é obrigatório')
    .matches(/^\d*\.?\d*$/, 'Digite um valor válido')
    .test('min', 'Valor mínimo: 0.1 ETH', (value) => {
      const num = parseFloat(value || '0');
      return num >= 0.1;
    })
    .test('max', 'Valor máximo: 10 ETH', (value) => {
      const num = parseFloat(value || '0');
      return num <= 10;
    }),
});

const LoanRequest: React.FC<LoanRequestProps> = ({ onRequest, disabled }) => {
  const formik = useFormik({
    initialValues: {
      amount: '',
    },
    validationSchema,
    onSubmit: (values) => {
      onRequest(values.amount);
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Solicitar Empréstimo
      </Typography>

      <TextField
        fullWidth
        id="amount"
        name="amount"
        label="Valor do Empréstimo (ETH)"
        value={formik.values.amount}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.amount && Boolean(formik.errors.amount)}
        helperText={formik.touched.amount && formik.errors.amount}
        disabled={disabled}
        sx={{ mb: 2 }}
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        O valor do empréstimo deve estar entre 0.1 e 10 ETH.
      </Alert>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={disabled || !formik.isValid}
      >
        Solicitar Análise
      </Button>
    </Box>
  );
};

export default LoanRequest; 