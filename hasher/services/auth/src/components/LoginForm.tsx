import React, { useState } from 'react';
import { login } from '../services/auth';
import { TextField, Button, Alert } from '@mui/material';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      window.location.href = '/dashboard';
    } catch {
      setError('Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" label="Email" margin="normal" fullWidth />
      <TextField type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" label="Senha" margin="normal" fullWidth />
      <Button type="submit" disabled={loading} variant="contained" color="primary">
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
    </form>
  );
} 