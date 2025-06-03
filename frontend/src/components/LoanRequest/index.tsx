import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const LoanRequest: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Solicitar Empréstimo
        </Typography>
      </Box>
    </Container>
  );
};

export default LoanRequest; 