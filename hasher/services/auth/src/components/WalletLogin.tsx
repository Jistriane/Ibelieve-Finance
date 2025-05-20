import React, { useState } from 'react';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import api from '../services/api';
import { Button, Alert } from '@mui/material';

export default function WalletLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWalletLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await web3Enable('Ibelieve');
      const accounts = await web3Accounts();
      if (accounts.length === 0) throw new Error('Nenhuma carteira encontrada');
      const address = accounts[0].address;
      // Obter nonce do backend
      const nonceRes = await api.get(`/api/auth/nonce?wallet_address=${address}`);
      const nonce = nonceRes.data.nonce;
      // Assinar nonce
      const injector = await web3FromAddress(address);
      const signRaw = injector.signer.signRaw;
      const { signature } = await signRaw({
        address,
        data: nonce,
        type: 'bytes'
      });
      // Enviar assinatura para autenticação
      const authRes = await api.post('/api/auth/authenticate', { wallet: address, signature });
      localStorage.setItem('token', authRes.data.token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar via carteira');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleWalletLogin} disabled={loading} variant="contained" color="secondary">
        {loading ? 'Conectando...' : 'Entrar com Carteira'}
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
} 