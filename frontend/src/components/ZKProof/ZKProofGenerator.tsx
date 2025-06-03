import React, { useState, useCallback } from 'react';
import { Button, TextField, Typography, Box, CircularProgress } from '@mui/material';
import { useWallet } from '../../hooks/useWallet';
import { useZKProof } from '../../hooks/useZKProof';
import { useAI } from '../../hooks/useAI';

const ZKProofGenerator: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { isConnected, address } = useWallet();
  const { generateProof, registerProof } = useZKProof();
  const { analyzeRisk } = useAI();

  const validateInputs = useCallback(() => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return false;
    }
    return true;
  }, [amount]);

  React.useEffect(() => {
    if (!validateInputs()) {
      // Lógica de validação
    }
  }, [validateInputs]);

  const handleGenerateProof = async () => {
    if (!isConnected || !amount) return;

    try {
      setIsGenerating(true);

      // Gerar prova ZK
      const proof = await generateProof({
        address,
        amount: parseFloat(amount),
      });

      // Analisar risco com IA
      const riskAnalysis = await analyzeRisk({
        address,
        amount: parseFloat(amount),
        proof,
      });

      if (riskAnalysis.approved) {
        // Registrar prova na blockchain
        await registerProof(proof);
      }

      // Limpar formulário
      setAmount('');
    } catch (error) {
      console.error('Erro ao gerar prova:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Gerar Prova ZK
      </Typography>

      <TextField
        label="Valor do Empréstimo"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        disabled={!isConnected || isGenerating}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleGenerateProof}
        disabled={!isConnected || !amount || isGenerating}
        fullWidth
      >
        {isGenerating ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Gerar Prova'
        )}
      </Button>
    </Box>
  );
};

export default ZKProofGenerator; 