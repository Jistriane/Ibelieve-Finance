import { ethers } from 'ethers';

export class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  isValidEthereumAddress(address: string): boolean {
    try {
      return ethers.utils.isAddress(address);
    } catch {
      return false;
    }
  }

  isValidAmount(amount: string | number): boolean {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return !isNaN(numAmount) && numAmount > 0;
  }

  isValidProof(proof: any): boolean {
    if (!proof || typeof proof !== 'object') {
      return false;
    }

    // Validar estrutura básica da prova ZK
    const requiredFields = ['proof', 'publicInputs', 'publicOutput'];
    return requiredFields.every(field => field in proof);
  }

  validateWalletConnection(walletType: string): boolean {
    const validTypes = ['metamask', 'subwallet'];
    return validTypes.includes(walletType);
  }

  validateRiskAnalysis(analysis: any): boolean {
    if (!analysis || typeof analysis !== 'object') {
      return false;
    }

    const requiredFields = ['approved', 'riskScore', 'reason'];
    return requiredFields.every(field => field in analysis);
  }

  validateTransaction(tx: any): boolean {
    if (!tx || typeof tx !== 'object') {
      return false;
    }

    const requiredFields = ['from', 'to', 'value', 'gas'];
    return requiredFields.every(field => field in tx);
  }

  validateProofRegistration(registration: any): boolean {
    if (!registration || typeof registration !== 'object') {
      return false;
    }

    const requiredFields = ['proofHash', 'timestamp', 'verifier'];
    return requiredFields.every(field => field in registration);
  }

  validateFraudDetection(detection: any): boolean {
    if (!detection || typeof detection !== 'object') {
      return false;
    }

    const requiredFields = ['isFraudulent', 'confidence', 'reason'];
    return requiredFields.every(field => field in detection);
  }

  validatePaymentMonitoring(monitoring: any): boolean {
    if (!monitoring || typeof monitoring !== 'object') {
      return false;
    }

    const requiredFields = ['isPaymentOnTime', 'daysLate', 'riskLevel'];
    return requiredFields.every(field => field in monitoring);
  }
} 