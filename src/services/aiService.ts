import axios from 'axios';

const OLLAMA_API_URL = import.meta.env.VITE_OLLAMA_API_URL || 'http://localhost:11434/api';
const MODEL_NAME = import.meta.env.VITE_MODEL_NAME || 'gemma-mistral';

interface AIResponse {
  response: string;
  context?: any;
}

export const chatWithAI = async (message: string): Promise<string> => {
  try {
    const response = await axios.post(`${OLLAMA_API_URL}/chat`, {
      model: MODEL_NAME,
      messages: [
        {
          role: 'user',
          content: message
        }
      ],
      stream: false
    });

    return response.data.message.content;
  } catch (error) {
    console.error('Erro na comunicação com a IA:', error);
    throw new Error('Falha ao comunicar com o serviço de IA');
  }
};

export const analyzeRisk = async (data: any): Promise<number> => {
  try {
    const response = await axios.post(`${OLLAMA_API_URL}/chat`, {
      model: MODEL_NAME,
      messages: [
        {
          role: 'user',
          content: `Analise o seguinte perfil financeiro e retorne apenas um número de 0 a 100 representando o risco: ${JSON.stringify(data)}`
        }
      ],
      stream: false
    });

    const score = parseInt(response.data.message.content);
    return isNaN(score) ? 50 : Math.min(Math.max(score, 0), 100);
  } catch (error) {
    console.error('Erro na análise de risco:', error);
    throw new Error('Falha ao analisar risco');
  }
};

export const optimizeZKP = async (proofType: string): Promise<{
  efficiency: number;
  recommendation: string;
}> => {
  try {
    const response = await axios.post(`${OLLAMA_API_URL}/chat`, {
      model: MODEL_NAME,
      messages: [
        {
          role: 'user',
          content: `Analise a eficiência do seguinte tipo de prova ZK e forneça recomendações: ${proofType}`
        }
      ],
      stream: false
    });

    const content = response.data.message.content;
    const efficiency = parseInt(content.match(/\d+/)?.[0] || '50');
    const recommendation = content.split('\n').slice(1).join('\n');

    return {
      efficiency: Math.min(Math.max(efficiency, 0), 100),
      recommendation
    };
  } catch (error) {
    console.error('Erro na otimização ZKP:', error);
    throw new Error('Falha ao otimizar prova ZK');
  }
};

export const detectFraud = async (transaction: any): Promise<{
  confidence: number;
  details: string;
}> => {
  try {
    const response = await axios.post(`${OLLAMA_API_URL}/chat`, {
      model: MODEL_NAME,
      messages: [
        {
          role: 'user',
          content: `Analise a seguinte transação para possíveis fraudes: ${JSON.stringify(transaction)}`
        }
      ],
      stream: false
    });

    const content = response.data.message.content;
    const confidence = parseInt(content.match(/\d+/)?.[0] || '50');
    const details = content.split('\n').slice(1).join('\n');

    return {
      confidence: Math.min(Math.max(confidence, 0), 100),
      details
    };
  } catch (error) {
    console.error('Erro na detecção de fraude:', error);
    throw new Error('Falha ao detectar fraudes');
  }
}; 