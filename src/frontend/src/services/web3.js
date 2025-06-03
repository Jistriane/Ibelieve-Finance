import { ethers } from 'ethers';

export const initWeb3 = async () => {
  try {
    // Verifica se o window.ethereum existe
    if (!window.ethereum) {
      throw new Error('MetaMask não encontrada. Por favor, instale a extensão MetaMask.');
    }

    // Solicita acesso à conta
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Cria provider e signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    return { provider, signer };
  } catch (error) {
    console.error('Erro ao inicializar Web3:', error);
    throw error;
  }
};

export const getAccount = async () => {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  } catch (error) {
    console.error('Erro ao obter conta:', error);
    return null;
  }
};

// Listener para mudanças de conta
export const setupAccountChangeListener = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      callback(accounts[0] || null);
    });
  }
};

// Listener para mudanças de rede
export const setupNetworkChangeListener = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', (chainId) => {
      callback(chainId);
    });
  }
};
