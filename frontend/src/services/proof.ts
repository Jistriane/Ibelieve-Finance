import * as snarkjs from 'snarkjs';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { zkVerifyConfig } from '../config/zkverify';

interface Groth16Proof {
  pi_a: [string, string];
  pi_b: [[string, string], [string, string]];
  pi_c: [string, string];
  protocol: string;
  curve: string;
}

export interface ProofResult {
  proof: Groth16Proof;
  publicSignals: string[];
  isApproved: boolean;
  timestamp: number;
  proofHash?: string;
}

function validateInput(value: number, fieldName: string) {
  if (!Number.isInteger(value)) {
    throw new Error(`${fieldName} deve ser um número inteiro.`);
  }
  if (value <= 0) {
    throw new Error(`${fieldName} deve ser maior que zero.`);
  }
  if (value > 4294967295) {
    throw new Error(`${fieldName} deve ser menor ou igual a 4.294.967.295.`);
  }
}

export async function generateProof(
  walletAddress: string,
  requestedAmount: number,
  netWorth: number
): Promise<ProofResult> {
  try {
    validateInput(requestedAmount, 'Valor solicitado');
    validateInput(netWorth, 'Patrimônio líquido');
    console.log('Iniciando geração de prova...');
    console.log('Parâmetros:', { walletAddress, requestedAmount, netWorth });

    // Carrega os arquivos do circuito
    console.log('Carregando arquivo wasm...');
    const wasmResponse = await fetch('/circuits/solvency.wasm');
    if (!wasmResponse.ok) {
      console.error('Erro ao carregar wasm:', wasmResponse.status, wasmResponse.statusText);
      throw new Error(`Erro ao carregar arquivo wasm: ${wasmResponse.statusText} (${wasmResponse.status})`);
    }
    
    console.log('Carregando arquivo zkey...');
    const zkeyResponse = await fetch('/circuits/solvency.zkey');
    if (!zkeyResponse.ok) {
      console.error('Erro ao carregar zkey:', zkeyResponse.status, zkeyResponse.statusText);
      throw new Error(`Erro ao carregar arquivo zkey: ${zkeyResponse.statusText} (${zkeyResponse.status})`);
    }
    
    const wasm = await wasmResponse.arrayBuffer();
    const zkey = await zkeyResponse.arrayBuffer();
    
    console.log('Arquivos carregados com sucesso');
    
    // Prepara os inputs para o circuito
    const input = {
      requestedAmount: requestedAmount.toString(),
      netWorth: netWorth.toString(),
      timestamp: Date.now().toString()
    };
    
    console.log('Inputs preparados:', input);
    
    // Gera a prova usando snarkjs
    console.log('Gerando prova com snarkjs...');
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      new Uint8Array(wasm),
      new Uint8Array(zkey)
    );

    console.log('Prova gerada com sucesso');
    
    // Calcula se o financiamento foi aprovado (30% do patrimônio líquido)
    const isApproved = requestedAmount <= netWorth * 0.3;
    const timestamp = Date.now();
    
    console.log('Resultado:', { isApproved, timestamp });

    // Registra a prova na blockchain
    console.log('Registrando prova na blockchain...');
    const proofHash = await registerProofOnChain(
      proof,
      requestedAmount,
      netWorth,
      isApproved,
      walletAddress
    );
    
    console.log('Prova registrada com sucesso. Hash:', proofHash);
    
    return {
      proof: proof as Groth16Proof,
      publicSignals,
      isApproved,
      timestamp,
      proofHash
    };
  } catch (error) {
    console.error('Erro detalhado ao gerar prova:', error);
    if (error instanceof Error) {
      throw new Error(`Falha ao gerar prova: ${error.message}`);
    }
    throw new Error('Falha ao gerar prova: Erro desconhecido');
  }
}

// Função para registrar a prova na blockchain
async function registerProofOnChain(
  proof: any,
  requestedAmount: number,
  netWorth: number,
  isApproved: boolean,
  walletAddress: string
): Promise<string> {
  try {
    // Inicializa a conexão com a blockchain
    const provider = new WsProvider(zkVerifyConfig.endpoints.ws);
    const api = await ApiPromise.create({ provider });

    // Aguarda a API estar pronta
    await api.isReady;

    // Gera o hash da prova
    const proofString = JSON.stringify(proof);
    const proofHash = api.createType('Hash', proofString).toHex();

    // Prepara os parâmetros da transação
    const requestedAmountBN = api.createType('Balance', requestedAmount.toString());
    const netWorthBN = api.createType('Balance', netWorth.toString());

    // Envia a transação
    const tx = await api.tx.proofRegistry.registerProof(
      proofHash,
      requestedAmountBN,
      netWorthBN,
      isApproved,
      walletAddress
    );

    // Assina e envia a transação
    const unsub = await tx.signAndSend(walletAddress, (result) => {
      if (result.status.isInBlock) {
        console.log('Transação incluída no bloco:', result.status.asInBlock.toHex());
      } else if (result.status.isFinalized) {
        console.log('Transação finalizada:', result.status.asFinalized.toHex());
        unsub();
      }
    });

    return proofHash;
  } catch (error) {
    console.error('Erro ao registrar prova na blockchain:', error);
    throw new Error('Falha ao registrar prova na blockchain');
  }
} 