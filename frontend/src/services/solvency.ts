import * as snarkjs from 'snarkjs';
import type { ZKArtifact } from 'snarkjs';
import { generateProof, type ProofResult } from './proof';

interface Groth16Proof {
  pi_a: [string, string];
  pi_b: [[string, string], [string, string]];
  pi_c: [string, string];
  protocol: string;
  curve: string;
}

export interface FinancingRequest {
  requestedAmount: number;
  netWorth: number; // Valor privado que não será revelado
}

export interface FinancingProof {
  isApproved: boolean;
  requestedAmount: number;
  netWorth: number;
  timestamp: number;
  proof: ProofResult['proof'];
  publicSignals: string[];
}

// Carrega os arquivos do circuito
async function loadCircuitFiles() {
  try {
    console.log('Iniciando carregamento dos arquivos do circuito...');

    // Carrega os arquivos como ArrayBuffer e converte para Uint8Array
    console.log('Carregando arquivo wasm...');
    const wasmResponse = await fetch('/circuits/solvency.wasm');
    if (!wasmResponse.ok) {
      throw new Error(`Erro ao carregar arquivo wasm: ${wasmResponse.statusText} (${wasmResponse.status})`);
    }
    const wasmBuffer = await wasmResponse.arrayBuffer();
    const wasm = new Uint8Array(wasmBuffer) as ZKArtifact;
    console.log('Arquivo wasm carregado com sucesso');

    console.log('Carregando arquivo zkey...');
    const zkeyResponse = await fetch('/circuits/solvency.zkey');
    if (!zkeyResponse.ok) {
      throw new Error(`Erro ao carregar arquivo zkey: ${zkeyResponse.statusText} (${zkeyResponse.status})`);
    }
    const zkeyBuffer = await zkeyResponse.arrayBuffer();
    const zkey = new Uint8Array(zkeyBuffer) as ZKArtifact;
    console.log('Arquivo zkey carregado com sucesso');

    console.log('Carregando arquivo de verificação...');
    const verificationKeyResponse = await fetch('/circuits/verification_key.json', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!verificationKeyResponse.ok) {
      throw new Error(`Erro ao carregar arquivo de verificação: ${verificationKeyResponse.statusText} (${verificationKeyResponse.status})`);
    }
    
    // Tenta fazer o parse do JSON apenas uma vez
    const text = await verificationKeyResponse.text();
    let verificationKey;
    try {
      verificationKey = JSON.parse(text);
      console.log('Arquivo de verificação carregado e parseado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer parse do arquivo de verificação:', error);
      console.error('Conteúdo recebido:', text);
      throw new Error('Arquivo de verificação não é um JSON válido');
    }

    return {
      wasm,
      zkey,
      verificationKey
    };
  } catch (error: unknown) {
    console.error('Erro ao carregar arquivos do circuito:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    throw new Error(`Falha ao carregar arquivos do circuito: ${errorMessage}`);
  }
}

export async function generateFinancingProof(request: FinancingRequest): Promise<FinancingProof> {
  try {
    // Simula a obtenção do endereço da carteira (em um caso real, viria do serviço de wallet)
    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
    
    // Gera a prova usando o serviço de prova
    const result = await generateProof(
      walletAddress,
      request.requestedAmount,
      request.netWorth
    );
    
    // Retorna o resultado formatado
    return {
      isApproved: result.isApproved,
      requestedAmount: request.requestedAmount,
      netWorth: request.netWorth,
      timestamp: result.timestamp,
      proof: result.proof,
      publicSignals: result.publicSignals
    };
  } catch (error) {
    console.error('Erro ao gerar prova de financiamento:', error);
    throw new Error('Falha ao gerar prova de financiamento');
  }
}

export async function verifyFinancingProof(proof: FinancingProof): Promise<boolean> {
  try {
    console.log('Iniciando verificação de prova...');
    const { verificationKey } = await loadCircuitFiles();
    const isValid = await snarkjs.groth16.verify(verificationKey, proof.publicSignals, proof.proof);
    console.log('Resultado da verificação:', isValid);
    return isValid;
  } catch (error: unknown) {
    console.error('Erro ao verificar prova de financiamento:', error);
    return false;
  }
} 