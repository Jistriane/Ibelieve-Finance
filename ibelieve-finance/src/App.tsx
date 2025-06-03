import React from 'react';
import { ThemeProvider, CssBaseline, Container, Box, Alert } from '@mui/material';
import { theme } from './theme';
import { WalletConnect } from './components/molecules/WalletConnect';
import { Typography } from './components/atoms/Typography';
import { Card } from './components/atoms/Card';
import { useWallet } from './hooks/useWallet';
import { ProofRegistration } from './components/organisms/ProofRegistration';

function App() {
  const { address, balance, loading, error, connect } = useWallet();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" responsive>
              IbelieveFinance
            </Typography>
            <WalletConnect
              address={address}
              onConnect={connect}
              loading={loading}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'grid', gap: 3 }}>
            {address && (
              <>
                <Card>
                  <Typography variant="h6" gutterBottom>
                    Saldo ETH
                  </Typography>
                  <Typography variant="body1">
                    {balance} ETH
                  </Typography>
                </Card>

                <ProofRegistration />
              </>
            )}

            {!address && (
              <Card>
                <Typography variant="body1" align="center" sx={{ py: 4 }}>
                  Conecte sua carteira para começar
                </Typography>
              </Card>
            )}
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
