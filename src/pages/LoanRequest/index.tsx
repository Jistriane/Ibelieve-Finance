import React from 'react';
import { Typography, Box } from '@mui/material';

const LoanRequest: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Solicitar Empréstimo
      </Typography>
      <Typography variant="body1">
        Em breve você poderá solicitar empréstimos aqui.
      </Typography>
    </Box>
  );
};

export default LoanRequest; 