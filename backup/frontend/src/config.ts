export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3004',
  ethereumRpcUrl: process.env.REACT_APP_ETHEREUM_RPC_URL || 'http://localhost:8545',
  proofRegistryAddress: process.env.REACT_APP_PROOF_REGISTRY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS || '0x63968b28367cc26a75eb078d22fe5060fb7ad10e',
  network: {
    chainId: process.env.REACT_APP_CHAIN_ID || '1337',
    rpcUrl: process.env.REACT_APP_RPC_URL || 'http://localhost:8545'
  }
}; 