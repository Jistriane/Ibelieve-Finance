export const zkVerifyConfig = {
  name: 'zkVerify Testnet',
  token: 'tVFY',
  decimals: 12,
  ss58Format: 42,
  endpoints: {
    ws: 'wss://zkverify-testnet.subscan.io/ws',
    rpc: 'https://zkverify-testnet.subscan.io/rpc',
    explorer: 'https://zkverify-testnet.subscan.io'
  },
  contract: {
    proofRegistry: process.env.REACT_APP_PROOF_REGISTRY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  },
  api: {
    url: process.env.REACT_APP_API_URL || 'http://localhost:3004'
  }
}; 