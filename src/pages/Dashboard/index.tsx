import React from 'react';
import { Typography, Box, Grid, Paper } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AIChat from '../../components/AIChat';
import ZKVerify from '../../components/ZKVerify';

const Dashboard: React.FC = () => {
  const { address, balance } = useSelector((state: RootState) => state.wallet);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {!address ? (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Conecte sua carteira para acessar o dashboard
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ZKVerify />
          </Grid>
          <Grid item xs={12} md={6}>
            <AIChat />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard; 