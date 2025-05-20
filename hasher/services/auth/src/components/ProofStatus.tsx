import React, { useState } from 'react';
import api from '../services/api';
import { TextField, Button, Alert } from '@mui/material';

export default function ProofStatus() {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    setStatus('');
    setError('');
    setDetails(null);
    try {
      const res = await api.get(`/api/proof/status?userId=${userId}`);
      setStatus(res.data.status);
      setDetails(res.data.details);
    } catch {
      setError('Erro ao consultar status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TextField value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID" label="User ID" margin="normal" />
      <Button onClick={handleCheck} disabled={loading} variant="contained" color="primary">
        {loading ? 'Consultando...' : 'Consultar Status'}
      </Button>
      {status && <Alert severity="success">Status: {status}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {details && <pre>{JSON.stringify(details, null, 2)}</pre>}
    </div>
  );
} 