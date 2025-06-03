import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Paper } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { generateZkProof, verifyZkProof } from '../services/zkpService';
import { setProofHash } from '../store/slices/zkpSlice';

interface ZkVerifyProps {
  loanAmount: number;
  onProofGenerated: (hash: string) => void;
}

const ZkVerify: React.FC<ZkVerifyProps> = ({ loanAmount, onProofGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proofHash, setLocalProofHash] = useState<string>('');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const dispatch = useDispatch();
  const walletAddress = useSelector((state: any) => state.wallet.address);

  const handleGenerateProof = async () => {
    if (!walletAddress) {
      alert('Por favor, conecte sua carteira primeiro!');
      return;
    }

    setIsGenerating(true);
    try {
      const proof = await generateZkProof({
        walletAddress,
        loanAmount,
        timestamp: Date.now()
      });

      const hash = await verifyZkProof(proof);
      setLocalProofHash(hash);
      dispatch(setProofHash(hash));
      onProofGenerated(hash);
      setVerificationStatus('success');
    } catch (error) {
      console.error('Erro ao gerar prova ZK:', error);
      setVerificationStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Verificação Zero-Knowledge
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateProof}
          disabled={isGenerating || !walletAddress}
          fullWidth
        >
          {isGenerating ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Gerando Prova...
            </>
          ) : (
            'Gerar Prova ZK'
          )}
        </Button>
      </Box>

      {proofHash && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Hash da Prova:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              wordBreak: 'break-all',
              bgcolor: 'grey.100',
              p: 1,
              borderRadius: 1
            }}
          >
            {proofHash}
          </Typography>
        </Box>
      )}

      {verificationStatus !== 'pending' && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            color={verificationStatus === 'success' ? 'success.main' : 'error.main'}
          >
            {verificationStatus === 'success'
              ? 'Prova verificada com sucesso!'
              : 'Erro na verificação da prova.'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ZkVerify; 