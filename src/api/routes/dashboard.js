const express = require('express');
const router = express.Router();

// Mock data para demonstração
const mockDashboardData = {
  solvencyIndex: '85%',
  totalAssets: '1.2M',
  aiScore: 92,
  solvencyHistory: [
    { name: 'Jan', valor: 4000 },
    { name: 'Fev', valor: 3000 },
    { name: 'Mar', valor: 5000 },
    { name: 'Abr', valor: 4500 },
    { name: 'Mai', valor: 6000 },
    { name: 'Jun', valor: 5500 },
  ],
  assetDistribution: [
    { name: 'Criptomoedas', value: 400 },
    { name: 'Ações', value: 300 },
    { name: 'Renda Fixa', value: 300 },
    { name: 'Outros', value: 200 },
  ],
  marketTrends: [
    {
      title: 'Tendência de Alta em DeFi',
      description: 'O setor de DeFi mostra sinais de recuperação com aumento de TVL',
    },
    {
      title: 'Regulamentação Cripto',
      description: 'Novas regulamentações podem impactar o mercado nos próximos meses',
    },
    {
      title: 'Análise de Mercado',
      description: 'Indicadores técnicos sugerem momento favorável para diversificação',
    },
  ],
};

// Rota para obter dados do dashboard
router.get('/data/:account', (req, res) => {
  try {
    // Aqui você implementaria a lógica para buscar dados reais
    res.json(mockDashboardData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
});

// Rota para atualizar preferências do dashboard
router.post('/preferences', async (req, res) => {
  try {
    const { account, preferences } = req.body;

    // Aqui você implementaria a lógica para salvar preferências

    res.json({ success: true, message: 'Preferências atualizadas com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar preferências' });
  }
});

module.exports = router;
