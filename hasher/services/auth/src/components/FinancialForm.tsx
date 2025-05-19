import React, { useState } from 'react';
import api from '../services/api';
import { TextField, Button, Alert } from '@mui/material';

export default function FinancialForm() {
  const [income, setIncome] = useState('');
  const [debts, setDebts] = useState('');
  const [status, setStatus] = useState('');
  const [proof, setProof] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    setError('');
    try {
      const res = await api.post('/api/proof/generate', {
        financial_data: { income, debts }
      });
      setProof(res.data.proof);
      setStatus(res.data.status);
    } catch {
      setError('Erro ao gerar prova');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField value={income} onChange={e => setIncome(e.target.value)} placeholder="Renda" label="Renda" margin="normal" fullWidth />
      <TextField value={debts} onChange={e => setDebts(e.target.value)} placeholder="Dívidas" label="Dívidas" margin="normal" fullWidth />
      <Button type="submit" disabled={loading} variant="contained" color="primary">
        {loading ? 'Gerando...' : 'Gerar Prova'}
      </Button>
      {status && <Alert severity="success">Status: {status}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {proof && <pre>{JSON.stringify(proof, null, 2)}</pre>}
    </form>
  );
} 