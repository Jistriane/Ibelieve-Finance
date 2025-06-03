import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { aiService } from '../../services/ai.service';

const ZKPOptimizer = () => {
  const [proofType, setProofType] = useState('');
  const [loading, setLoading] = useState(false);
  const [optimization, setOptimization] = useState<{
    response: string;
    confidence: number;
    details?: any;
  } | null>(null);

  const handleOptimize = async () => {
    if (!proofType) return;

    setLoading(true);
    try {
      const result = await aiService.optimizeZKP(proofType);
      setOptimization(result);
    } catch (error) {
      console.error('Erro na otimização ZKP:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Otimização de Prova Zero
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tipo de Prova</InputLabel>
          <Select
            value={proofType}
            onChange={(e) => setProofType(e.target.value)}
            label="Tipo de Prova"
          >
            <MenuItem value="range">Prova de Range</MenuItem>
            <MenuItem value="membership">Prova de Membership</MenuItem>
            <MenuItem value="equality">Prova de Igualdade</MenuItem>
            <MenuItem value="comparison">Prova de Comparação</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={handleOptimize}
          disabled={loading || !proofType}
          fullWidth
        >
          Otimizar Prova
        </Button>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {optimization && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Eficiência da Otimização
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={optimization.confidence * 100}
                  color={optimization.confidence > 0.8 ? 'success' : 'warning'}
                />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  {`${Math.round(optimization.confidence * 100)}%`}
                </Typography>
              </Box>
            </Box>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Recomendações
            </Typography>
            <Typography variant="body1" paragraph>
              {optimization.response}
            </Typography>

            {optimization.details && (
              <>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Detalhes Técnicos
                </Typography>
                <List>
                  {Object.entries(optimization.details).map(([key, value]) => (
                    <ListItem key={key}>
                      <ListItemText
                        primary={key}
                        secondary={value as string}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ZKPOptimizer; 