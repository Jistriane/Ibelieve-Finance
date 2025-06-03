import { ethers } from 'ethers';
import axios from 'axios';

const ZKP_API_URL = import.meta.env.VITE_ZKP_API_URL || 'http://localhost:3001/api';

interface ZkProofData {
  walletAddress: string;
  loanAmount: number;
  timestamp: number;
}

export const generateZkProof = async (data: ZkProofData): Promise<string> => {
  try {
    const response = await axios.post(`${ZKP_API_URL}/zkp/generate`, data);
    return response.data.proof;
  } catch (error) {
    console.error('Erro ao gerar prova ZK:', error);
    throw new Error('Falha ao gerar prova ZK');
  }
};

export const verifyZkProof = async (proof: string): Promise<string> => {
  try {
    const response = await axios.post(`${ZKP_API_URL}/zkp/verify`, { proof });
    return response.data.hash;
  } catch (error) {
    console.error('Erro ao verificar prova ZK:', error);
    throw new Error('Falha ao verificar prova ZK');
  }
};

export const registerProofOnChain = async (
  proofHash: string,
  walletAddress: string,
  loanAmount: number
): Promise<string> => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Aqui você deve substituir pelo endereço do seu contrato inteligente
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    const contractABI = []; // Adicione o ABI do seu contrato aqui

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const tx = await contract.registerProof(proofHash, walletAddress, loanAmount);
    const receipt = await tx.wait();

    return receipt.transactionHash;
  } catch (error) {
    console.error('Erro ao registrar prova na blockchain:', error);
    throw new Error('Falha ao registrar prova na blockchain');
  }
};

export const checkLoanStatus = async (proofHash: string): Promise<{
  approved: boolean;
  limit: number;
  timestamp: number;
}> => {
  try {
    const response = await axios.get(`${ZKP_API_URL}/loan/status/${proofHash}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao verificar status do empréstimo:', error);
    throw new Error('Falha ao verificar status do empréstimo');
  }
};

export const getWalletBalance = async (walletAddress: string): Promise<number> => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(walletAddress);
    return parseFloat(ethers.utils.formatEther(balance));
  } catch (error) {
    console.error('Erro ao obter saldo da carteira:', error);
    throw new Error('Falha ao obter saldo da carteira');
  }
}; 