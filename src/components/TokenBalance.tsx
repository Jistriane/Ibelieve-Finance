import React from 'react';
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
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Info,
  SwapHoriz,
  AttachMoney
} from '@mui/icons-material';

interface TokenBalanceProps {
  token: {
    symbol: string;
    name: string;
    balance: string;
    value: string;
    change24h: number;
    price: string;
  };
  isLoading?: boolean;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({
  token,
  isLoading
}) => {
  const theme = useTheme();

  const getChangeColor = (change: number) => {
    if (change > 0) return theme.palette.success.main;
    if (change < 0) return theme.palette.error.main;
    return theme.palette.warning.main;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp />;
    if (change < 0) return <TrendingDown />;
    return <SwapHoriz />;
  };

  const metrics = [
    {
      key: 'balance',
      label: 'Saldo',
      value: token.balance,
      icon: <AccountBalance />,
      color: theme.palette.primary.main,
      tooltip: 'Saldo atual do token'
    },
    {
      key: 'value',
      label: 'Valor Total',
      value: token.value,
      icon: <AttachMoney />,
      color: theme.palette.secondary.main,
      tooltip: 'Valor total em USD'
    },
    {
      key: 'price',
      label: 'Preço Atual',
      value: token.price,
      icon: <AttachMoney />,
      color: theme.palette.info.main,
      tooltip: 'Preço atual do token em USD'
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
          <AccountBalance />
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          >
            {token.name} ({token.symbol})
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: theme.palette.text.secondary,
              }}
            >
              Variação 24h:
            </Typography>
            <Chip
              size="small"
              icon={getChangeIcon(token.change24h)}
              label={`${token.change24h > 0 ? '+' : ''}${token.change24h}%`}
              sx={{
                background: alpha(getChangeColor(token.change24h), 0.1),
                color: getChangeColor(token.change24h),
                '& .MuiChip-icon': {
                  color: 'inherit',
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
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
      )}
    </Paper>
  );
};

export default TokenBalance; 