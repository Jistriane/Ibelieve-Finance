export const WALLET_CONFIG = {
  name: 'subwallet-js',
  appName: 'iBelieve Finance',
  network: {
    name: 'tVFY',
    chainId: '0x36B0', // 14000 em hex
    rpcUrl: 'https://volta-rpc.zkverify.io',
    blockExplorer: 'https://volta-explorer.zkverify.io',
  },
  errors: {
    NOT_INSTALLED: 'SubWallet não encontrada. Por favor, instale a extensão SubWallet.',
    NOT_ENABLED: 'SubWallet não está habilitada. Por favor, habilite a extensão.',
    NO_ACCOUNTS: 'Nenhuma conta encontrada na SubWallet. Por favor, importe uma conta.',
    WRONG_NETWORK: 'Por favor, conecte-se à rede tVFY para continuar.',
    CONNECTION_ERROR: 'Erro ao conectar com a SubWallet. Por favor, tente novamente.',
    DISCONNECTION_ERROR: 'Erro ao desconectar da SubWallet. Por favor, tente novamente.',
    ADDRESS_NOT_FOUND: 'Endereço da conta não encontrado.',
    NOT_CONNECTED: 'Nenhuma carteira conectada.',
  },
  messages: {
    CONNECT_SUCCESS: 'SubWallet conectada com sucesso!',
    DISCONNECT_SUCCESS: 'SubWallet desconectada com sucesso!',
    ACCOUNT_CHANGED: 'Conta da SubWallet alterada.',
    NETWORK_CHANGED: 'Rede da SubWallet alterada.',
  },
};
