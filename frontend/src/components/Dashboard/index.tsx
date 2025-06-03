import React from 'react';
import { Container, Typography, Box, Grid, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { ProofHistory } from '../ZKProof/ProofHistory';

export function Dashboard() {
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        {!isConnected ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Conecte sua carteira para começar
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Você precisa conectar sua carteira para acessar todas as funcionalidades.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Carteira Conectada
                </Typography>
                <Typography variant="body1" paragraph>
                  Endereço: {address?.slice(0, 6)}...{address?.slice(-4)}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/loan')}
                  fullWidth
                >
                  Solicitar Empréstimo
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Histórico de Provas
                </Typography>
                <ProofHistory />
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
} 