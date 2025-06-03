import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  alpha,
  Grid,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Security,
  Warning,
  CheckCircle,
  Error,
  Info,
  Shield,
  GppGood,
  GppBad
} from '@mui/icons-material';

interface FraudDetectionProps {
  status: 'safe' | 'warning' | 'danger';
  checks: {
    identity: boolean;
    transaction: boolean;
    location: boolean;
    device: boolean;
  };
  alerts: {
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}

const FraudDetection: React.FC<FraudDetectionProps> = ({
  status,
  checks,
  alerts
}) => {
  const theme = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'safe':
        return {
          icon: <GppGood />,
          color: theme.palette.success.main,
          label: 'Seguro',
          message: 'Nenhuma atividade suspeita detectada'
        };
      case 'warning':
        return {
          icon: <Warning />,
          color: theme.palette.warning.main,
          label: 'Atenção',
          message: 'Algumas atividades requerem atenção'
        };
      case 'danger':
        return {
          icon: <GppBad />,
          color: theme.palette.error.main,
          label: 'Perigo',
          message: 'Atividades suspeitas detectadas'
        };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const statusConfig = getStatusConfig();

  const checkConfigs = [
    {
      key: 'identity',
      label: 'Verificação de Identidade',
      icon: <Security />,
      color: theme.palette.primary.main
    },
    {
      key: 'transaction',
      label: 'Análise de Transação',
      icon: <Shield />,
      color: theme.palette.secondary.main
    },
    {
      key: 'location',
      label: 'Verificação de Localização',
      icon: <Info />,
      color: theme.palette.info.main
    },
    {
      key: 'device',
      label: 'Verificação de Dispositivo',
      icon: <Security />,
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
        border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${statusConfig.color}, ${alpha(statusConfig.color, 0.5)})`,
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
            background: alpha(statusConfig.color, 0.1),
            color: statusConfig.color,
          }}
        >
          {statusConfig.icon}
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: statusConfig.color,
              fontWeight: 600,
            }}
          >
            Detecção de Fraude
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            {statusConfig.message}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {checkConfigs.map((config) => (
          <Grid item xs={12} sm={6} key={config.key}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: alpha(config.color, 0.1),
                border: `1px solid ${alpha(config.color, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: alpha(config.color, 0.2),
                  color: config.color,
                }}
              >
                {config.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: config.color,
                    fontWeight: 500,
                    mb: 0.5,
                  }}
                >
                  {config.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {checks[config.key as keyof typeof checks] ? (
                    <Chip
                      icon={<CheckCircle />}
                      label="Verificado"
                      size="small"
                      sx={{
                        background: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        '& .MuiChip-icon': {
                          color: theme.palette.success.main,
                        },
                      }}
                    />
                  ) : (
                    <Chip
                      icon={<Error />}
                      label="Não Verificado"
                      size="small"
                      sx={{
                        background: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main,
                        '& .MuiChip-icon': {
                          color: theme.palette.error.main,
                        },
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {alerts.length > 0 && (
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 500,
              mb: 2,
            }}
          >
            Alertas
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {alerts.map((alert, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: alpha(getSeverityColor(alert.severity), 0.1),
                  border: `1px solid ${alpha(getSeverityColor(alert.severity), 0.2)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: getSeverityColor(alert.severity),
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {alert.type}
                  </Typography>
                  <Chip
                    label={alert.severity}
                    size="small"
                    sx={{
                      background: alpha(getSeverityColor(alert.severity), 0.2),
                      color: getSeverityColor(alert.severity),
                      fontWeight: 500,
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                  }}
                >
                  {alert.message}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default FraudDetection; 