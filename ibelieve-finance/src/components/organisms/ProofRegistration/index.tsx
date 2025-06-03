import React, { useState } from 'react';
import {
  Box,
  TextField,
  Alert,
  Grid,
} from '@mui/material';
import { Button } from '../../atoms/Button';
import { Typography } from '../../atoms/Typography';
import { Card } from '../../atoms/Card';
import { useZKProof } from '../../../hooks/useZKProof';

export const ProofRegistration: React.FC = () => {
  const [proofData, setProofData] = useState('');
  const { proofState, statistics, registerProof, verifyProof } = useZKProof();

  const handleRegister = async () => {
    if (!proofData.trim()) return;
    await registerProof(proofData);
  };

  const handleVerify = async () => {
    if (!proofData.trim()) return;
    await verifyProof(proofData);
  };

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Card>
        <Typography variant="h5" gutterBottom>
          Registro de Provas Zero-Knowledge
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Registre e verifique provas de forma segura e privada na blockchain.
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Dados da Prova"
          value={proofData}
          onChange={(e) => setProofData(e.target.value)}
          placeholder="Digite ou cole os dados da prova aqui..."
          sx={{ mb: 2 }}
        />

        <Grid container spacing={2}>
          <Grid item component="div" xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleRegister}
              loading={proofState.loading}
              disabled={!proofData.trim()}
            >
              Registrar Prova
            </Button>
          </Grid>
          <Grid item component="div" xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleVerify}
              loading={proofState.loading}
              disabled={!proofData.trim()}
            >
              Verificar Prova
            </Button>
          </Grid>
        </Grid>

        {proofState.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {proofState.error}
          </Alert>
        )}

        {proofState.success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {proofState.success === true
              ? 'Operação realizada com sucesso!'
              : 'Prova verificada com sucesso!'}
          </Alert>
        )}
      </Card>

      {statistics && (
        <Card>
          <Typography variant="h6" gutterBottom>
            Estatísticas
          </Typography>
          <Grid container spacing={3}>
            <Grid item component="div" xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Total de Provas
              </Typography>
              <Typography variant="h6">{statistics.totalProofs}</Typography>
            </Grid>
            <Grid item component="div" xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Provas Verificadas
              </Typography>
              <Typography variant="h6">{statistics.verifiedProofs}</Typography>
            </Grid>
            <Grid item component="div" xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Tokens Queimados
              </Typography>
              <Typography variant="h6">{statistics.totalTokensBurned} ACME</Typography>
            </Grid>
            <Grid item component="div" xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Subwallets Ativas
              </Typography>
              <Typography variant="h6">{statistics.activeSubwallets}</Typography>
            </Grid>
          </Grid>
        </Card>
      )}
    </Box>
  );
}; 