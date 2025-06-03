import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoanForm from '../components/loan/LoanForm';

const NewLoan: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/loans');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Solicitar Novo Empréstimo
      </Typography>

      <LoanForm onSuccess={handleSuccess} />
    </Box>
  );
};

export default NewLoan; 