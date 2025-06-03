export const CONFIG = {
  NETWORK: {
    NAME: import.meta.env.VITE_NETWORK_NAME || 'sepolia',
    CHAIN_ID: 11155111, // Sepolia chain ID
  },
  CONTRACTS: {
    ACME_TOKEN: import.meta.env.VITE_ACME_TOKEN_ADDRESS || '',
    ZKPROOF_REGISTRY: import.meta.env.VITE_ZKPROOF_REGISTRY_ADDRESS || '',
  },
  WEB3: {
    INFURA_ID: import.meta.env.VITE_INFURA_ID || '',
    RPC_URL: `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_ID}`,
  },
  UI: {
    TOAST_DURATION: 5000,
    TRANSACTION_TIMEOUT: 30000,
  },
} as const;

export const ERRORS = {
  WALLET_CONNECTION: 'Erro ao conectar carteira',
  NETWORK_MISMATCH: 'Por favor, conecte-se à rede Sepolia',
  CONTRACT_INTERACTION: 'Erro na interação com o contrato',
  PROOF_REGISTRATION: 'Erro ao registrar prova',
  PROOF_VERIFICATION: 'Erro ao verificar prova',
  SUBWALLET_MANAGEMENT: 'Erro na gestão de subwallet',
} as const; 