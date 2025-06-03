export const config = {
  appName: 'I Believe Finance',
  network: {
    chainId: '0x1', // Ethereum Mainnet
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3/YOUR-PROJECT-ID'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  },
  contracts: {
    loanContract: process.env.REACT_APP_LOAN_CONTRACT_ADDRESS || '',
  },
  ai: {
    baseUrl: process.env.REACT_APP_OLLAMA_URL || 'http://localhost:11434/api',
    model: 'gemma',
    maxTokens: 2000,
    temperature: 0.7,
  },
  zkProof: {
    minConfidence: 0.8,
    maxProofTime: 30000, // 30 segundos
  },
}; 