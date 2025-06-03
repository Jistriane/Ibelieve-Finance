import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useZKProof } from '../../hooks/useZKProof';

interface Proof {
  id: string;
  address: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

export const ProofHistory: React.FC = () => {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { zkProofService } = useZKProof();

  const fetchProofs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const history = await zkProofService.getProofHistory();
      setProofs(history);
    } catch (err) {
      setError('Erro ao carregar histórico de provas');
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  }, [zkProofService]);

  useEffect(() => {
    fetchProofs();
  }, [fetchProofs]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (proofs.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Nenhuma prova encontrada
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Histórico de Provas
      </Typography>
      {proofs.map((proof) => (
        <Box
          key={proof.id}
          sx={{
            p: 2,
            mb: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography variant="body1">
            Endereço: {proof.address.slice(0, 6)}...{proof.address.slice(-4)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Valor: {proof.amount} ETH
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {proof.status}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Data: {new Date(proof.timestamp).toLocaleString()}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}; 