const axios = require('axios');

class RiskAnalysisAI {
  constructor(endpoint = 'http://localhost:11434/api/chat', useMock = false) {
    this.endpoint = endpoint;
    this.useMock = useMock;
  }

  async analyzeRisk(data) {
    try {
      if (this.useMock) {
        return this.getMockAnalysis(data);
      }

      const prompt = this.constructRiskAnalysisPrompt(data);

      try {
        const response = await axios.post(this.endpoint, {
          model: 'mistral',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        return this.parseAIResponse(response.data);
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          console.log('AI service offline, using mock data');
          return this.getMockAnalysis(data);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error in AI risk analysis:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getMockAnalysis(data) {
    const assets = parseFloat(data.assets);
    const liabilities = parseFloat(data.liabilities);
    const ratio = liabilities / assets;

    const riskScore = Math.min(Math.round(ratio * 100), 100);
    const confidenceLevel = 80;

    const riskFactors = [
      ratio > 0.7 ? 'Alto índice de endividamento' : 'Índice de endividamento saudável',
      data.transactions.length === 0
        ? 'Histórico de transações limitado'
        : 'Histórico de transações adequado',
      Object.keys(data.marketConditions).length === 0
        ? 'Dados de mercado insuficientes'
        : 'Condições de mercado analisadas',
    ];

    const recommendations = [
      ratio > 0.7 ? 'Reduzir endividamento' : 'Manter nível de endividamento atual',
      data.transactions.length === 0
        ? 'Estabelecer histórico de transações'
        : 'Continuar padrão de transações',
      'Monitorar condições de mercado',
    ];

    return {
      success: true,
      analysis: {
        riskScore,
        riskFactors,
        recommendations,
        confidenceLevel,
        rawAnalysis: `Mock Analysis:
                    Risk Score: ${riskScore}
                    Key Risk Factors:
                    ${riskFactors.join('\n')}
                    Recommendations:
                    ${recommendations.join('\n')}
                    Confidence Level: ${confidenceLevel}`,
      },
    };
  }

  constructRiskAnalysisPrompt(data) {
    return `Analyze the following financial data for risk assessment:
            - Assets: ${data.assets}
            - Liabilities: ${data.liabilities}
            - Transaction History: ${JSON.stringify(data.transactions)}
            - Market Conditions: ${JSON.stringify(data.marketConditions)}

            Please provide:
            1. Risk Score (0-100)
            2. Key Risk Factors
            3. Recommendations
            4. Confidence Level`;
  }

  parseAIResponse(response) {
    try {
      const analysis = response.message.content;

      // Extract structured data from AI response
      const riskScore = this.extractRiskScore(analysis);
      const riskFactors = this.extractRiskFactors(analysis);
      const recommendations = this.extractRecommendations(analysis);
      const confidenceLevel = this.extractConfidenceLevel(analysis);

      return {
        success: true,
        analysis: {
          riskScore,
          riskFactors,
          recommendations,
          confidenceLevel,
          rawAnalysis: analysis,
        },
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        success: false,
        error: 'Failed to parse AI response',
      };
    }
  }

  extractRiskScore(analysis) {
    const match = analysis.match(/Risk Score.*?(\d+)/i);
    return match ? parseInt(match[1]) : null;
  }

  extractRiskFactors(analysis) {
    const factors = analysis.match(/Key Risk Factors:(.*?)(?=Recommendations|$)/s);
    return factors
      ? factors[1]
          .trim()
          .split('\n')
          .map((f) => f.trim())
          .filter((f) => f)
      : [];
  }

  extractRecommendations(analysis) {
    const recommendations = analysis.match(/Recommendations:(.*?)(?=Confidence Level|$)/s);
    return recommendations
      ? recommendations[1]
          .trim()
          .split('\n')
          .map((r) => r.trim())
          .filter((r) => r)
      : [];
  }

  extractConfidenceLevel(analysis) {
    const match = analysis.match(/Confidence Level.*?(\d+)/i);
    return match ? parseInt(match[1]) : null;
  }
}

module.exports = RiskAnalysisAI;
