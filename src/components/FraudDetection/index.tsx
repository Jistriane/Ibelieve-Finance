import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert,
  LinearProgress,
} from '@mui/material';
import { RootState } from '../../store';
import { aiService } from '../../services/ai.service';

const FraudDetection = () => {
  const { address } = useSelector((state: RootState) => state.wallet);
  const [loading, setLoading] = useState(false);
  const [detection, setDetection] = useState<{
    isFraudulent: boolean;
    confidence: number;
    details: string[];
  } | null>(null);

  const handleDetect = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const result = await aiService.detectFraud({
        address,
        timestamp: Date.now(),
      });
      setDetection(result);
    } catch (error) {
      console.error('Erro na detecção de fraude:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Conecte sua carteira para verificar fraudes
        </Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Detecção de Fraudes
        </Typography>

        {!detection && !loading && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleDetect}
            fullWidth
          >
            Verificar Transações
          </Button>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {detection && (
          <Box sx={{ mt: 2 }}>
            <Alert
              severity={detection.isFraudulent ? 'error' : 'success'}
              sx={{ mb: 2 }}
            >
              {detection.isFraudulent
                ? 'Foram detectadas atividades suspeitas!'
                : 'Nenhuma atividade suspeita detectada.'}
            </Alert>

            <Typography variant="subtitle1" gutterBottom>
              Nível de Confiança
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={detection.confidence * 100}
                  color={detection.confidence > 0.8 ? 'success' : 'warning'}
                />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  {`${Math.round(detection.confidence * 100)}%`}
                </Typography>
              </Box>
            </Box>

            {detection.details.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Detalhes da Análise
                </Typography>
                <List>
                  {detection.details.map((detail, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={detail} />
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

export default FraudDetection; 