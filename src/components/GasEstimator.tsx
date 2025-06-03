import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  alpha,
  Grid,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  LocalGasStation,
  Speed,
  Timer,
  Info,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';

interface GasEstimatorProps {
  gasPrice: string;
  gasLimit: number;
  estimatedCost: string;
  priorityFee: string;
  baseFee: string;
  isLoading?: boolean;
}

const GasEstimator: React.FC<GasEstimatorProps> = ({
  gasPrice,
  gasLimit,
  estimatedCost,
  priorityFee,
  baseFee,
  isLoading
}) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  const getPriorityColor = (fee: string) => {
    const feeValue = parseFloat(fee);
    if (feeValue < 1) return theme.palette.success.main;
    if (feeValue < 3) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getPriorityLabel = (fee: string) => {
    const feeValue = parseFloat(fee);
    if (feeValue < 1) return 'Baixo';
    if (feeValue < 3) return 'Médio';
    return 'Alto';
  };

  const metrics = [
    {
      key: 'gasPrice',
      label: 'Preço do Gás',
      value: gasPrice,
      icon: <LocalGasStation />,
      color: theme.palette.primary.main,
      tooltip: 'Preço atual do gás na rede'
    },
    {
      key: 'gasLimit',
      label: 'Limite de Gás',
      value: gasLimit.toLocaleString(),
      icon: <Speed />,
      color: theme.palette.secondary.main,
      tooltip: 'Limite máximo de gás para a transação'
    },
    {
      key: 'estimatedCost',
      label: 'Custo Estimado',
      value: estimatedCost,
      icon: <TrendingUp />,
      color: theme.palette.info.main,
      tooltip: 'Custo total estimado da transação'
    }
  ];

  const details = [
    {
      key: 'priorityFee',
      label: 'Taxa de Prioridade',
      value: priorityFee,
      icon: <TrendingUp />,
      color: getPriorityColor(priorityFee),
      tooltip: 'Taxa adicional para priorizar a transação'
    },
    {
      key: 'baseFee',
      label: 'Taxa Base',
      value: baseFee,
      icon: <TrendingDown />,
      color: theme.palette.warning.main,
      tooltip: 'Taxa base da rede'
    }
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 4,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.5)})`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            <LocalGasStation />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
              }}
            >
              Estimativa de Gás
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: theme.palette.text.secondary,
              }}
            >
              Análise em tempo real
            </Typography>
          </Box>
        </Box>
        <Tooltip title={showDetails ? "Ocultar detalhes" : "Mostrar detalhes"}>
          <IconButton
            onClick={() => setShowDetails(!showDetails)}
            sx={{
              color: theme.palette.primary.main,
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <Info />
          </IconButton>
        </Tooltip>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <>
          <Grid container spacing={3}>
            {metrics.map((metric) => (
              <Grid item xs={12} sm={4} key={metric.key}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: alpha(metric.color, 0.1),
                    border: `1px solid ${alpha(metric.color, 0.2)}`,
                    height: '100%',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: alpha(metric.color, 0.2),
                        color: metric.color,
                      }}
                    >
                      {metric.icon}
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: metric.color,
                        fontWeight: 500,
                      }}
                    >
                      {metric.label}
                    </Typography>
                    <Tooltip title={metric.tooltip}>
                      <Info sx={{ fontSize: 16, color: alpha(metric.color, 0.7) }} />
                    </Tooltip>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 600,
                    }}
                  >
                    {metric.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {showDetails && (
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 2,
                }}
              >
                Detalhes Adicionais
              </Typography>
              <Grid container spacing={3}>
                {details.map((detail) => (
                  <Grid item xs={12} sm={6} key={detail.key}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: alpha(detail.color, 0.1),
                        border: `1px solid ${alpha(detail.color, 0.2)}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: alpha(detail.color, 0.2),
                            color: detail.color,
                          }}
                        >
                          {detail.icon}
                        </Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: detail.color,
                            fontWeight: 500,
                          }}
                        >
                          {detail.label}
                        </Typography>
                        <Tooltip title={detail.tooltip}>
                          <Info sx={{ fontSize: 16, color: alpha(detail.color, 0.7) }} />
                        </Tooltip>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                          }}
                        >
                          {detail.value}
                        </Typography>
                        {detail.key === 'priorityFee' && (
                          <Chip
                            size="small"
                            label={getPriorityLabel(detail.value)}
                            sx={{
                              background: alpha(detail.color, 0.1),
                              color: detail.color,
                            }}
                          />
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default GasEstimator; 