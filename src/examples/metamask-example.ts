import { metamaskService } from '../services/metamask.service';
import { Transaction } from '../types/metamask.types';

async function exemploMetaMask() {
  try {
    // Verifica conexão
    const conectado = await metamaskService.checkConnection();
    console.log('Conexão com MetaMask:', conectado ? 'Estabelecida' : 'Falhou');

    // Endereço de exemplo
    const endereco = '0xE8f35A0B15AD587E1b0967BCc2024dE834667dC9';

    // Valida endereço
    const enderecoValido = await metamaskService.validateAddress(endereco);
    console.log('Endereço válido:', enderecoValido);

    if (enderecoValido) {
      // Obtém saldo
      const saldo = await metamaskService.getWalletBalance(endereco);
      console.log('Saldo da carteira:', saldo);

      // Obtém preço do gas
      const gasPrice = await metamaskService.getGasPrice();
      console.log('Preços do Gas:', gasPrice);

      // Exemplo de transação
      const transacao: Transaction = {
        from: endereco,
        to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        value: '0.1',
        gasPrice: gasPrice.standard,
      };

      // Envia transação
      const hashTransacao = await metamaskService.sendTransaction(transacao);
      console.log('Hash da transação:', hashTransacao);

      // Obtém histórico de transações
      const historico = await metamaskService.getTransactionHistory(endereco);
      console.log('Histórico de transações:', historico);
    }
  } catch (error) {
    console.error('Erro ao executar exemplo:', error);
  }
}

// Executa o exemplo
exemploMetaMask();
