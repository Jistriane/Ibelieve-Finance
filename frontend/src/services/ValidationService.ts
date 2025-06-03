interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  // Regras de validação comuns
  private readonly rules = {
    required: {
      validate: (value: any) => value !== undefined && value !== null && value !== '',
      message: 'Este campo é obrigatório',
    },
    email: {
      validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Email inválido',
    },
    minLength: (min: number) => ({
      validate: (value: string) => value.length >= min,
      message: `Mínimo de ${min} caracteres`,
    }),
    maxLength: (max: number) => ({
      validate: (value: string) => value.length <= max,
      message: `Máximo de ${max} caracteres`,
    }),
    number: {
      validate: (value: any) => !isNaN(Number(value)),
      message: 'Deve ser um número',
    },
    min: (min: number) => ({
      validate: (value: number) => value >= min,
      message: `Valor mínimo: ${min}`,
    }),
    max: (max: number) => ({
      validate: (value: number) => value <= max,
      message: `Valor máximo: ${max}`,
    }),
    ethereumAddress: {
      validate: (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value),
      message: 'Endereço Ethereum inválido',
    },
  };

  // Validação de campos específicos
  validateLoanRequest(data: {
    amount: number;
    term: number;
    income: number;
    expenses: number;
  }): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Validação do valor do empréstimo
    if (!this.rules.required.validate(data.amount)) {
      errors.amount = this.rules.required.message;
    } else if (!this.rules.number.validate(data.amount)) {
      errors.amount = this.rules.number.message;
    } else if (!this.rules.min(100).validate(data.amount)) {
      errors.amount = this.rules.min(100).message;
    } else if (!this.rules.max(1000000).validate(data.amount)) {
      errors.amount = this.rules.max(1000000).message;
    }

    // Validação do prazo
    if (!this.rules.required.validate(data.term)) {
      errors.term = this.rules.required.message;
    } else if (!this.rules.number.validate(data.term)) {
      errors.term = this.rules.number.message;
    } else if (!this.rules.min(1).validate(data.term)) {
      errors.term = this.rules.min(1).message;
    } else if (!this.rules.max(60).validate(data.term)) {
      errors.term = this.rules.max(60).message;
    }

    // Validação da renda
    if (!this.rules.required.validate(data.income)) {
      errors.income = this.rules.required.message;
    } else if (!this.rules.number.validate(data.income)) {
      errors.income = this.rules.number.message;
    } else if (!this.rules.min(0).validate(data.income)) {
      errors.income = this.rules.min(0).message;
    }

    // Validação das despesas
    if (!this.rules.required.validate(data.expenses)) {
      errors.expenses = this.rules.required.message;
    } else if (!this.rules.number.validate(data.expenses)) {
      errors.expenses = this.rules.number.message;
    } else if (!this.rules.min(0).validate(data.expenses)) {
      errors.expenses = this.rules.min(0).message;
    }

    // Validação adicional: despesas não podem ser maiores que a renda
    if (data.expenses > data.income) {
      errors.expenses = 'Despesas não podem ser maiores que a renda';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  validateWalletAddress(address: string): { isValid: boolean; error?: string } {
    if (!this.rules.required.validate(address)) {
      return { isValid: false, error: this.rules.required.message };
    }

    if (!this.rules.ethereumAddress.validate(address)) {
      return { isValid: false, error: this.rules.ethereumAddress.message };
    }

    return { isValid: true };
  }

  validateZKProof(proof: string): { isValid: boolean; error?: string } {
    if (!this.rules.required.validate(proof)) {
      return { isValid: false, error: this.rules.required.message };
    }

    // TODO: Implementar validação específica para provas ZK
    return { isValid: true };
  }
} 