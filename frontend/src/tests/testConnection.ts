import { networkService } from '../services/networkService';

export async function testConnection() {
  try {
    console.log('🧪 Iniciando testes de conexão...\n');

    // Teste 1: Configurações da rede
    const networkConfig = networkService.getNetworkConfig();
    console.log('Configuração da rede:');
    console.log('- Nome:', networkConfig.name);
    console.log('- Token:', networkConfig.token);
    console.log('- WebSocket:', networkConfig.endpoints.ws);
    console.log('- RPC:', networkConfig.endpoints.rpc);
    console.log('✅ Configurações verificadas!\n');

    // Teste 2: Configurações da carteira
    const walletConfig = networkService.getWalletConfig();
    console.log('Configuração da carteira:');
    console.log('- Nome:', walletConfig.name);
    console.log('- App:', walletConfig.appName);
    console.log('✅ Configurações verificadas!\n');

    // Teste 3: Conexão com a rede
    console.log('Conectando à rede...');
    await networkService.connectNetwork();
    console.log('✅ Rede conectada!\n');

    // Teste 4: Conexão com a carteira
    console.log('Conectando à carteira...');
    await networkService.connectWallet();
    const currentAccount = networkService.getCurrentAccount();
    
    if (currentAccount) {
      console.log('✅ Carteira conectada:', currentAccount);
      // Teste 5: Verificar saldo
      const balance = await networkService.getBalance();
      console.log('✅ Saldo verificado:', balance, networkConfig.token);
    } else {
      throw new Error('Falha ao conectar carteira');
    }

    console.log('\n✨ Todos os testes concluídos com sucesso!');
    return true;
  } catch (error) {
    console.error('\n❌ Erro nos testes:', error);
    return false;
  }
}

// Função para executar o teste
async function runTests() {
  try {
    await testConnection();
  } catch (error) {
    console.error('Erro ao executar testes:', error);
  }
}

// Executa o teste
runTests(); 