import React, { useState } from 'react';
import './App.css';
import { connectWallet, disconnectWallet } from './services/wallet';
import { generateProof, ProofResult } from './services/proof';
import { AINavigation } from './components/AINavigation';
import NetworkInfoComponent from './components/NetworkInfo';

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [proofResult, setProofResult] = useState<ProofResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState<number>(0);
  const [netWorth, setNetWorth] = useState<number>(0);

  const handleConnectWallet = async () => {
    try {
      setError(null);
      setIsConnecting(true);
      const address = await connectWallet();
      setWalletAddress(address);
      setIsConnected(true);
    } catch (err) {
      console.error('Erro ao conectar:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao conectar SubWallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      setError(null);
      await disconnectWallet();
      setWalletAddress(null);
      setProofResult(null);
      setIsConnected(false);
    } catch (err) {
      console.error('Erro ao desconectar:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao desconectar SubWallet');
    }
  };

  const handleGenerateProof = async () => {
    if (!walletAddress) return;

    try {
      setError(null);
      setIsGeneratingProof(true);
      const result = await generateProof(
        walletAddress,
        requestedAmount,
        netWorth
      );
      setProofResult(result);
    } catch (err) {
      console.error('Erro ao gerar prova:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao gerar prova');
    } finally {
      setIsGeneratingProof(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setRequestedAmount(value);
  };

  const handleNetWorthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setNetWorth(value);
  };

  return (
    <div className="App">
      <AINavigation />
      
      <main className="App-main">
        <div className="solvency-form">
          {!isConnected ? (
            <button 
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className={isConnecting ? 'loading' : ''}
            >
              {isConnecting ? 'Conectando...' : 'Conectar SubWallet'}
            </button>
          ) : (
            <>
              <div className="wallet-address">
                <p>Carteira Conectada</p>
                <strong>{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</strong>
                <button onClick={handleDisconnectWallet} className="disconnect-button">
                  Desconectar
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="requestedAmount">Valor Solicitado (USD)</label>
                <input
                  type="number"
                  id="requestedAmount"
                  value={requestedAmount}
                  onChange={handleAmountChange}
                  min="0"
                  step="0.01"
                  placeholder="Digite o valor solicitado"
                />
              </div>

              <div className="form-group">
                <label htmlFor="netWorth">Patrimônio Líquido (USD)</label>
                <input
                  type="number"
                  id="netWorth"
                  value={netWorth}
                  onChange={handleNetWorthChange}
                  min="0"
                  step="0.01"
                  placeholder="Digite seu patrimônio líquido"
                />
              </div>

              <button 
                onClick={handleGenerateProof}
                disabled={!walletAddress || isGeneratingProof || requestedAmount <= 0 || netWorth <= 0}
                className={isGeneratingProof ? 'loading' : ''}
              >
                {isGeneratingProof ? 'Gerando Prova...' : 'Gerar Prova'}
              </button>
            </>
          )}
        </div>

        {proofResult && (
          <div className="proof-result">
            <h3>Prova ZKP Gerada</h3>
            <div className="proof-details">
              <p><strong>Commitment:</strong> {proofResult.publicSignals[0]}</p>
              <p><strong>Timestamp:</strong> {new Date(Number(proofResult.publicSignals[1])).toLocaleString()}</p>
              <p><strong>Carteira:</strong> {proofResult.publicSignals[2]}</p>
              <p><strong>Status:</strong> {proofResult.isApproved ? '✓ Aprovado' : '✗ Não Aprovado'}</p>
            </div>
            <div className="verification-status success">
              ✓ Prova verificada com sucesso
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            {error.includes('não encontrada') && (
              <p className="wallet-info">
                Instale a <a href="https://subwallet.app/" target="_blank" rel="noopener noreferrer">SubWallet</a> para continuar
              </p>
            )}
          </div>
        )}
      </main>

      <NetworkInfoComponent />
    </div>
  );
}

export default App;
