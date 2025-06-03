import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  useTheme,
  alpha,
  Grid,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Security,
  TrendingUp,
  AccountBalance,
  Timeline,
  Info
} from '@mui/icons-material';

interface RiskAnalysisProps {
  score: number;
  factors: {
    creditScore: number;
    transactionHistory: number;
    collateralValue: number;
    marketRisk: number;
  };
  recommendations: string[];
}

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({
  score,
  factors,
  recommendations
}) => {
  const theme = useTheme();

  const getScoreColor = (value: number) => {
    if (value >= 80) return theme.palette.success.main;
    if (value >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getScoreLabel = (value: number) => {
    if (value >= 80) return 'Baixo Risco';
    if (value >= 60) return 'Risco Moderado';
    return 'Alto Risco';
  };

  const factorConfigs = [
    {
      key: 'creditScore',
      label: 'Score de Crédito',
      icon: <Security />,
      color: theme.palette.primary.main
    },
    {
      key: 'transactionHistory',
      label: 'Histórico de Transações',
      icon: <Timeline />,
      color: theme.palette.secondary.main
    },
    {
      key: 'collateralValue',
      label: 'Valor da Garantia',
      icon: <AccountBalance />,
      color: theme.palette.info.main
    },
    {
      key: 'marketRisk',
      label: 'Risco de Mercado',
      icon: <TrendingUp />,
      color: theme.palette.warning.main
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
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${getScoreColor(score)}, ${alpha(getScoreColor(score), 0.5)})`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: alpha(getScoreColor(score), 0.1),
            color: getScoreColor(score),
          }}
        >
          <Security sx={{ fontSize: 32 }} />
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: getScoreColor(score),
              fontWeight: 600,
            }}
          >
            Análise de Risco
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            {getScoreLabel(score)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 500,
            }}
          >
            Score Geral
          </Typography>
          <Tooltip title="Score calculado com base em múltiplos fatores de risco">
            <IconButton size="small">
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ position: 'relative', mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(getScoreColor(score), 0.1),
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${getScoreColor(score)}, ${alpha(getScoreColor(score), 0.5)})`,
              },
            }}
          />
        </Box>
        <Typography
          variant="h4"
          sx={{
            color: getScoreColor(score),
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          {score}%
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {factorConfigs.map((config) => (
          <Grid item xs={12} sm={6} key={config.key}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: alpha(config.color, 0.1),
                border: `1px solid ${alpha(config.color, 0.2)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: alpha(config.color, 0.2),
                    color: config.color,
                  }}
                >
                  {config.icon}
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: config.color,
                    fontWeight: 500,
                  }}
                >
                  {config.label}
                </Typography>
              </Box>
              <Box sx={{ position: 'relative', mb: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={factors[config.key as keyof typeof factors]}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(config.color, 0.1),
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${config.color}, ${alpha(config.color, 0.5)})`,
                    },
                  }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: config.color,
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {factors[config.key as keyof typeof factors]}%
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {recommendations.length > 0 && (
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 500,
              mb: 2,
            }}
          >
            Recomendações
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          >
            {recommendations.map((recommendation, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  mb: index < recommendations.length - 1 ? 1 : 0,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.info.main,
                    fontWeight: 500,
                  }}
                >
                  •
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                  }}
                >
                  {recommendation}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default RiskAnalysis; 