const OLLAMA_API_URL = 'http://localhost:11434/api';

interface OllamaResponse {
  response: string;
  done: boolean;
}

export const analyzeWithOllama = async (text: string): Promise<{
  riskScore: number;
  efficiencyScore: number;
  fraudScore: number;
  recommendations: string[];
}> => {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma:7b',
        prompt: `Analise a seguinte solicitação financeira e forneça uma análise detalhada:
        "${text}"
        
        Forneça a análise no seguinte formato JSON:
        {
          "riskScore": número de 0 a 100,
          "efficiencyScore": número de 0 a 100,
          "fraudScore": número de 0 a 100,
          "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3"]
        }`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao comunicar com o Ollama');
    }

    const data: OllamaResponse = await response.json();
    
    try {
      const analysis = JSON.parse(data.response);
      return {
        riskScore: analysis.riskScore,
        efficiencyScore: analysis.efficiencyScore,
        fraudScore: analysis.fraudScore,
        recommendations: analysis.recommendations,
      };
    } catch (error) {
      console.error('Erro ao analisar resposta do Ollama:', error);
      throw new Error('Resposta do Ollama em formato inválido');
    }
  } catch (error) {
    console.error('Erro na análise com Ollama:', error);
    throw error;
  }
}; 