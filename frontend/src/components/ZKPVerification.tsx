import React from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { ProofStatus } from '../types/zkp';

interface ZKPVerificationProps {
  onGenerateProof: () => Promise<void>;
  onVerifyProof: () => Promise<void>;
  status: ProofStatus;
}

const ZKPVerification: React.FC<ZKPVerificationProps> = ({
  onGenerateProof,
  onVerifyProof,
  status,
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);

  const handleGenerateProof = async () => {
    try {
      setIsGenerating(true);
      await onGenerateProof();
    } catch (error) {
      console.error('Erro ao gerar prova:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyProof = async () => {
    try {
      setIsVerifying(true);
      await onVerifyProof();
    } catch (error) {
      console.error('Erro ao verificar prova:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Verificação ZKP
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          Para finalizar o empréstimo, é necessário gerar e verificar uma prova
          zero conhecimento que garante a privacidade dos seus dados.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateProof}
            disabled={isGenerating || isVerifying || status === 'verified'}
            startIcon={isGenerating ? <CircularProgress size={20} /> : null}
          >
            {isGenerating ? 'Gerando Prova...' : 'Gerar Prova'}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleVerifyProof}
            disabled={
              isVerifying ||
              isGenerating ||
              status !== 'generated' ||
              status === 'verified'
            }
            startIcon={isVerifying ? <CircularProgress size={20} /> : null}
          >
            {isVerifying ? 'Verificando...' : 'Verificar Prova'}
          </Button>
        </Box>
      </Paper>

      {status === 'generated' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Prova gerada com sucesso! Agora você pode verificar a prova.
        </Alert>
      )}

      {status === 'verified' && (
        <Alert severity="success">
          Prova verificada com sucesso! Seu empréstimo foi aprovado e os fundos
          serão transferidos para sua carteira.
        </Alert>
      )}

      {status === 'error' && (
        <Alert severity="error">
          Ocorreu um erro durante o processo. Por favor, tente novamente.
        </Alert>
      )}
    </Box>
  );
};

export default ZKPVerification; 