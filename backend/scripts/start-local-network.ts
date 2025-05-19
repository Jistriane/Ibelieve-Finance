import { ethers } from 'ethers';

async function main() {
  // Configuração do provedor
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  
  // Verifica se a rede está rodando
  try {
    await provider.getNetwork();
    console.log('Rede local já está rodando');
  } catch (error) {
    console.error('Erro ao conectar à rede local. Certifique-se de que o Hardhat está rodando.');
    process.exit(1);
  }

  // Lista as contas disponíveis
  const accounts = await provider.listAccounts();
  console.log('Contas disponíveis:');
  accounts.forEach((account, index) => {
    console.log(`${index}: ${account}`);
  });

  // Mostra o saldo da primeira conta
  const balance = await provider.getBalance(accounts[0]);
  console.log('\nSaldo da primeira conta:', ethers.utils.formatEther(balance), 'ETH');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 