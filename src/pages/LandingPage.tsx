import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import WalletConnect from '../components/WalletConnect';
import ZkVerify from '../components/ZkVerify';
import AIAssistant from '../components/AIAssistant';
import { registerProofOnChain, checkLoanStatus, getWalletBalance } from '../services/zkpService';

const LandingPage: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [proofHash, setProofHash] = useState<string>('');
  const [loanStatus, setLoanStatus] = useState<{
    approved: boolean;
    limit: number;
    timestamp: number;
  } | null>(null);
  const [error, setError] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const theme = useTheme();

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  const handleProofGenerated = async (hash: string) => {
    setProofHash(hash);
    setIsProcessing(true);
    try {
      await registerProofOnChain(hash, walletAddress, parseFloat(loanAmount));
      const status = await checkLoanStatus(hash);
      setLoanStatus(status);
    } catch (error) {
      console.error('Erro ao processar empréstimo:', error);
      setError('Erro ao processar empréstimo. Por favor, tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.5)}, transparent)`,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.5)}, transparent)`,
          },
        }}
      >
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.3)}, transparent)`,
                },
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}
              >
                I Believe Finance
              </Typography>
              <WalletConnect onConnect={handleWalletConnect} />
            </Box>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mb: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                Solicitar Empréstimo
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Valor do Empréstimo"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  disabled={isProcessing}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
                
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={!walletAddress || !loanAmount || isProcessing}
                  onClick={() => {}}
                  sx={{
                    height: 48,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    },
                  }}
                >
                  {isProcessing ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Solicitar Empréstimo'
                  )}
                </Button>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    background: alpha(theme.palette.error.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  }}
                >
                  {error}
                </Alert>
              )}

              {proofHash && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    background: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: theme.palette.primary.main }}
                  >
                    Status do Empréstimo
                  </Typography>
                  {loanStatus ? (
                    <>
                      <Typography
                        variant="body1"
                        sx={{
                          color: loanStatus.approved
                            ? theme.palette.success.main
                            : theme.palette.warning.main,
                        }}
                      >
                        Status: {loanStatus.approved ? 'Aprovado' : 'Em Análise'}
                      </Typography>
                      <Typography variant="body1">
                        Limite: {loanStatus.limit} ETH
                      </Typography>
                      <Typography variant="body1">
                        Data/Hora: {formatDate(loanStatus.timestamp)}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body1">
                      Processando solicitação...
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>

            <ZkVerify
              loanAmount={parseFloat(loanAmount) || 0}
              onProofGenerated={handleProofGenerated}
            />
          </Grid>

          {/* AI Assistant */}
          <Grid item xs={12} md={4}>
            <AIAssistant />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default LandingPage; 