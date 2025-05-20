import { generateProof } from '../proof';

// Mock do fetch
global.fetch = jest.fn();

describe('Proof Service', () => {
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Mock das respostas do fetch
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('wasm')) {
        return Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
        });
      }
      if (url.includes('zkey')) {
        return Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
        });
      }
      return Promise.reject(new Error('URL não mapeada'));
    });
  });

  it('deve gerar uma prova válida', async () => {
    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
    const requestedAmount = 1000;
    const netWorth = 10000;

    const result = await generateProof(walletAddress, requestedAmount, netWorth);

    expect(result).toHaveProperty('proof');
    expect(result).toHaveProperty('publicSignals');
    expect(result.proof).toHaveProperty('pi_a');
    expect(result.proof).toHaveProperty('pi_b');
    expect(result.proof).toHaveProperty('pi_c');
    expect(result.proof).toHaveProperty('protocol');
    expect(result.proof).toHaveProperty('curve');
  });

  it('deve lançar erro quando os arquivos do circuito não são encontrados', async () => {
    // Mock de erro no fetch
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: false,
        statusText: 'Not Found'
      })
    );

    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
    const requestedAmount = 1000;
    const netWorth = 10000;

    await expect(generateProof(walletAddress, requestedAmount, netWorth))
      .rejects
      .toThrow('Erro ao carregar arquivos do circuito');
  });

  it('deve validar os inputs corretamente', async () => {
    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
    const requestedAmount = -1000; // Valor negativo
    const netWorth = 0; // Valor zero

    await expect(generateProof(walletAddress, requestedAmount, netWorth))
      .rejects
      .toThrow();
  });
}); 