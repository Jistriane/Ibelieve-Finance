import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoanList from '../components/loan/LoanList';

const Loans: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Meus Empréstimos</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/loans/new')}
        >
          Novo Empréstimo
        </Button>
      </Box>

      <LoanList />
    </Box>
  );
};

export default Loans; 