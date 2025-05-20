import React from 'react';
import { networkService } from '../services/networkService';

export function NetworkInfo() {
  const [account, setAccount] = React.useState<string | undefined>();
  const [balance, setBalance] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const connect = async () => {
    setError(null);
    setLoading(true);
    try {
      await networkService.connectNetwork();
      await networkService.connectWallet();
      const acc = networkService.getCurrentAccount();
      setAccount(acc);
      if (acc) {
        const bal = await networkService.getBalance(acc);
        setBalance(bal);
      }
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, background: 'linear-gradient(90deg, #7F5AF0, #2CB67D)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
        Ibelieve Finance
      </h1>
      <p style={{ color: '#ccc', marginBottom: 32 }}>
        Sistema de Prova de Solvência Financeira com ZKPs na rede <b>tVFY</b>
      </p>
      <button onClick={connect} style={{ padding: 12, fontSize: 18, background: '#2CB67D', color: '#fff', border: 'none', borderRadius: 8 }} disabled={loading}>
        {loading ? 'Conectando...' : 'Conectar SubWallet (tVFY)'}
      </button>
      {error && (
        <div style={{ color: 'red', marginTop: 16 }}>{error}</div>
      )}
      {account && (
        <div style={{ marginTop: 32 }}>
          <div><b>Conta conectada:</b> {account}</div>
          <div><b>Saldo:</b> {balance} tVFY</div>
        </div>
      )}
    </div>
  );
}

export default NetworkInfo; 