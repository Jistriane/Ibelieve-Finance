import {
  initWeb3,
  getAccount,
  setupAccountChangeListener,
  setupNetworkChangeListener,
} from './web3';

export const connectWallet = async (onAccountChange) => {
  try {
    const { provider, signer } = await initWeb3();
    const account = await getAccount();

    // Configura listeners
    setupAccountChangeListener(onAccountChange);
    setupNetworkChangeListener(() => {
      window.location.reload();
    });

    return account;
  } catch (error) {
    console.error('Erro ao conectar carteira:', error);
    throw error;
  }
};

export const disconnectWallet = async () => {
  try {
    // Remove listeners
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
    return true;
  } catch (error) {
    console.error('Erro ao desconectar carteira:', error);
    throw error;
  }
};

export const isWalletConnected = async () => {
  try {
    const account = await getAccount();
    return !!account;
  } catch (error) {
    console.error('Erro ao verificar conexão da carteira:', error);
    return false;
  }
};
