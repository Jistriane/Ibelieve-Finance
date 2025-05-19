import React, { useState } from 'react';
import api from '../services/api';
import { Button, Alert } from '@mui/material';
import { logout } from '../services/auth';
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'SUA_DSN_SENTRY_AQUI',
  tracesSampleRate: 1.0,
});

export default function ProofSubmit({ proof }: { proof: any }) {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setStatus('');
    setError('');
    try {
      const res = await api.post('/api/proof/submit', { proof });
      setStatus(res.data.status);
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureMessage('Usuário acessou Dashboard');
      }
    } catch {
      setError('Erro ao enviar prova');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleSubmit} disabled={loading} variant="contained" color="primary">
        {loading ? 'Enviando...' : 'Enviar Prova'}
      </Button>
      {status && <Alert severity="success">Status: {status}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Button onClick={logout} color="secondary" variant="outlined">Sair</Button>
    </div>
  );
} 