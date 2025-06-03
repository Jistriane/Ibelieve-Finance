const express = require('express');
const cors = require('cors');
const SolvencyProof = require('../zkp/solvencyProof');
const RiskAnalysisAI = require('../ai/riskAnalysis');
const analysisRoutes = require('./routes/analysis');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const solvencyProof = new SolvencyProof();
const riskAnalysis = new RiskAnalysisAI();

// Routes
app.use('/api/analysis', analysisRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.post('/api/solvency/generate', async (req, res) => {
  try {
    const { assets, liabilities } = req.body;
    const result = await solvencyProof.generateProof(assets, liabilities);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/solvency/verify', async (req, res) => {
  try {
    const { proof, publicInputs } = req.body;
    const result = await solvencyProof.verifyProof(proof, publicInputs);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/solvency/register', async (req, res) => {
  try {
    const { proof, publicInputs } = req.body;
    const result = await solvencyProof.registerProofOnChain(proof, publicInputs);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/risk/analyze', async (req, res) => {
  try {
    const { assets, liabilities, marketConditions } = req.body;

    // Simulação de análise de risco com IA
    const analysis = {
      riskScore: Math.floor(Math.random() * 100),
      confidenceLevel: 95,
      riskFactors: [
        'Concentração de ativos em um único setor',
        'Exposição a ativos voláteis',
        'Baixa diversificação geográfica',
      ],
      recommendations: [
        'Diversifique sua carteira em diferentes setores',
        'Considere aumentar sua posição em ativos de menor risco',
        'Avalie oportunidades em diferentes regiões',
      ],
    };

    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Nova rota para sugestões da IA
app.post('/api/ai/suggestions', async (req, res) => {
  try {
    const { assets, liabilities, marketTrends } = req.body;

    // Simulação de sugestões da IA
    const suggestions = [
      'Com base no seu perfil, considere aumentar sua exposição a renda fixa',
      'As condições de mercado sugerem um momento oportuno para diversificação',
      'Mantenha uma reserva de emergência equivalente a 6 meses de despesas',
      'Considere investimentos em setores defensivos para reduzir a volatilidade',
    ];

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para tendências de mercado
app.get('/api/market/trends', (req, res) => {
  try {
    const trends = [
      {
        title: 'DeFi em Alta',
        description:
          'O setor de DeFi mostra sinais de recuperação com aumento significativo de TVL',
      },
      {
        title: 'Regulamentação Cripto',
        description: 'Novas regulamentações podem impactar o mercado nos próximos meses',
      },
      {
        title: 'Análise Técnica',
        description: 'Indicadores sugerem momento favorável para diversificação de portfólio',
      },
    ];

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
