import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
} from '@mui/material';
import { RootState } from '../../store';
import { aiService } from '../../services/ai.service';

const RiskAnalysis = () => {
  const { address } = useSelector((state: RootState) => state.wallet);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    score: number;
    recommendations: string[];
    details: {
      creditHistory: number;
      collateral: number;
      transactionHistory: number;
    };
  } | null>(null);

  const handleAnalyze = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const result = await aiService.analyzeRisk(address, 1); // Valor fixo para exemplo
      setAnalysis(result);
    } catch (error) {
      console.error('Erro na análise de risco:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Conecte sua carteira para ver a análise de risco
        </Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Análise de Risco
        </Typography>

        {!analysis && !loading && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAnalyze}
            fullWidth
          >
            Iniciar Análise
          </Button>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {analysis && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Pontuação de Risco
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={analysis.score}
                  color={analysis.score > 70 ? 'success' : analysis.score > 40 ? 'warning' : 'error'}
                />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  {`${Math.round(analysis.score)}%`}
                </Typography>
              </Box>
            </Box>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Detalhes da Análise
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Histórico de Crédito"
                  secondary={`${analysis.details.creditHistory}%`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Garantias"
                  secondary={`${analysis.details.collateral}%`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Histórico de Transações"
                  secondary={`${analysis.details.transactionHistory}%`}
                />
              </ListItem>
            </List>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Recomendações
            </Typography>
            <List>
              {analysis.recommendations.map((recommendation, index) => (
                <ListItem key={index}>
                  <ListItemText primary={recommendation} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskAnalysis; 