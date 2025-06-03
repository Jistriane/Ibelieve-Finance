import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { WALLET_CONFIG } from '../config/wallet';

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
let accountsChangedCallback: ((accounts: string[]) => void) | null = null;

// Verifica se a SubWallet está instalada
export async function checkSubWalletInstalled(): Promise<boolean> {
  return window.SubWallet !== undefined;
}

// Verifica se a SubWallet está habilitada
export async function isSubWalletEnabled(): Promise<boolean> {
  try {
    if (!window.SubWallet) {
      return false;
    }
    return await window.SubWallet.isEnabled();
  } catch (error) {
    console.error('Erro ao verificar status da SubWallet:', error);
    return false;
  }
}

// Configura o listener para mudanças de conta
function setupAccountsChangedListener(callback: (address: string | null) => void): void {
  if (!window.SubWallet) return;

  accountsChangedCallback = (accounts: string[]) => {
    const newAddress = accounts.length > 0 ? accounts[0] : null;
    currentAddress = newAddress;
    callback(newAddress);
  };

  window.SubWallet.on('accountsChanged', accountsChangedCallback);
}

export async function connectWallet(
  onAccountsChanged?: (address: string | null) => void,
): Promise<string> {
  try {
    // Verificar se a SubWallet está instalada
    if (!(await checkSubWalletInstalled())) {
      throw new Error(WALLET_CONFIG.errors.NOT_INSTALLED);
    }

    // Verificar se a SubWallet está habilitada
    if (!(await isSubWalletEnabled())) {
      throw new Error(WALLET_CONFIG.errors.NOT_ENABLED);
    }

    // Habilitar extensão SubWallet
    const extensions = await web3Enable(WALLET_CONFIG.appName);
    const subwallet = extensions.find((ext) => ext.name === WALLET_CONFIG.name);

    if (!subwallet) {
      throw new Error(WALLET_CONFIG.errors.NOT_INSTALLED);
    }

    // Solicitar acesso às contas
    const accounts = await web3Accounts();

    if (!accounts || accounts.length === 0) {
      throw new Error(WALLET_CONFIG.errors.NO_ACCOUNTS);
    }

    // Usar a primeira conta disponível
    const selectedAccount = accounts[0];
    const address = selectedAccount.address;

    if (!address) {
      throw new Error(WALLET_CONFIG.errors.ADDRESS_NOT_FOUND);
    }

    currentAddress = address;

    // Configurar listener para mudanças de conta se callback fornecido
    if (onAccountsChanged) {
      setupAccountsChangedListener(onAccountsChanged);
    }

    return address;
  } catch (error) {
    console.error('Erro ao conectar carteira:', error);
    throw error;
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    if (!currentAddress) {
      throw new Error(WALLET_CONFIG.errors.NOT_CONNECTED);
    }

    // Limpar o endereço atual
    currentAddress = null;

    // Remover listeners se houver
    if (window.SubWallet && accountsChangedCallback) {
      window.SubWallet.removeListener('accountsChanged', accountsChangedCallback);
      accountsChangedCallback = null;
    }
  } catch (error) {
    console.error('Erro ao desconectar carteira:', error);
    throw error;
  }
}

// Retorna o endereço atual da carteira conectada
export function getCurrentAddress(): string | null {
  return currentAddress;
}
