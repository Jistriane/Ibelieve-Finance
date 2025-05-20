import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

// Adiciona a declaração do tipo para a SubWallet
declare global {
  interface Window {
    SubWallet?: {
      enable: () => Promise<string[]>;
      isEnabled: () => Promise<boolean>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
}

let currentAddress: string | null = null;

export async function connectWallet(): Promise<string> {
  try {
    // Habilitar extensão SubWallet
    const extensions = await web3Enable('iBelieve Finance');
    const subwallet = extensions.find(ext => ext.name === 'subwallet-js');
    
    if (!subwallet) {
      throw new Error('SubWallet não encontrada. Por favor, instale a extensão SubWallet.');
    }

    // Solicitar acesso às contas
    const accounts = await web3Accounts();
    
    if (!accounts || accounts.length === 0) {
      throw new Error('Nenhuma conta encontrada na SubWallet. Por favor, importe uma conta.');
    }
    
    // Usar a primeira conta disponível
    const selectedAccount = accounts[0];
    currentAddress = selectedAccount.address;
    
    return currentAddress;
  } catch (error) {
    console.error('Erro ao conectar carteira:', error);
    throw error;
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    currentAddress = null;
  } catch (error) {
    console.error('Erro ao desconectar carteira:', error);
    throw error;
  }
} 