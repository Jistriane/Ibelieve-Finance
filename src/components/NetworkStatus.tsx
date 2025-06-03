import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  alpha,
  Grid,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Wifi,
  SignalCellularAlt,
  Speed,
  Memory,
  Storage,
  Timer
} from '@mui/icons-material';

interface NetworkStatusProps {
  networkInfo: {
    name: string;
    chainId: string;
    blockNumber: number;
    gasPrice: string;
    latency: number;
    peers: number;
  };
  isLoading?: boolean;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({
  networkInfo,
  isLoading
}) => {
  const theme = useTheme();

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return theme.palette.success.main;
    if (latency < 300) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getLatencyLabel = (latency: number) => {
    if (latency < 100) return 'Ótimo';
    if (latency < 300) return 'Bom';
    return 'Lento';
  };

  const metrics = [
    {
      key: 'blockNumber',
      label: 'Bloco Atual',
      value: networkInfo.blockNumber.toLocaleString(),
      icon: <Storage />,
      color: theme.palette.primary.main
    },
    {
      key: 'gasPrice',
      label: 'Preço do Gás',
      value: networkInfo.gasPrice,
      icon: <Speed />,
      color: theme.palette.secondary.main
    },
    {
      key: 'latency',
      label: 'Latência',
      value: `${networkInfo.latency}ms`,
      icon: <Timer />,
      color: getLatencyColor(networkInfo.latency)
    },
    {
      key: 'peers',
      label: 'Peers Conectados',
      value: networkInfo.peers,
      icon: <SignalCellularAlt />,
      color: theme.palette.info.main
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
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
          <Wifi />
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          >
            Status da Rede
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            {networkInfo.name} (Chain ID: {networkInfo.chainId})
          </Typography>
        </Box>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {metrics.map((metric) => (
            <Grid item xs={12} sm={6} md={3} key={metric.key}>
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
                {metric.key === 'latency' && (
                  <Chip
                    size="small"
                    label={getLatencyLabel(networkInfo.latency)}
                    sx={{
                      mt: 1,
                      background: alpha(metric.color, 0.1),
                      color: metric.color,
                    }}
                  />
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default NetworkStatus; 