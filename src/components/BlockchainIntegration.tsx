import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  useTheme,
  alpha,
  Grid,
  Chip,
  Tooltip,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  AccountBalance,
  SwapHoriz,
  CheckCircle,
  Error,
  Info,
  Link,
  Token,
  Security
} from '@mui/icons-material';

interface BlockchainIntegrationProps {
  onConnect: () => Promise<void>;
  isConnecting: boolean;
  isConnected: boolean;
  networkInfo?: {
    chainId: string;
    networkName: string;
    rpcUrl: string;
    blockExplorer: string;
  };
  contractInfo?: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  };
}

const BlockchainIntegration: React.FC<BlockchainIntegrationProps> = ({
  onConnect,
  isConnecting,
  isConnected,
  networkInfo,
  contractInfo
}) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  const getStatusConfig = () => {
    if (isConnecting) {
      return {
        icon: <CircularProgress size={24} />,
        color: theme.palette.info.main,
        label: 'Conectando',
        message: 'Estabelecendo conexão com a blockchain...'
      };
    }
    if (isConnected) {
      return {
        icon: <CheckCircle />,
        color: theme.palette.success.main,
        label: 'Conectado',
        message: 'Conectado à rede blockchain com sucesso'
      };
    }
    return {
      icon: <AccountBalance />,
      color: theme.palette.warning.main,
      label: 'Desconectado',
      message: 'Aguardando conexão com a blockchain'
    };
  };

  const statusConfig = getStatusConfig();

  const connectionSteps = [
    {
      key: 'network',
      label: 'Conexão com a Rede',
      icon: <Link />,
      color: theme.palette.primary.main,
      status: isConnected ? 'completed' : isConnecting ? 'processing' : 'pending'
    },
    {
      key: 'contract',
      label: 'Contrato Inteligente',
      icon: <Token />,
      color: theme.palette.secondary.main,
      status: isConnected ? 'completed' : isConnecting ? 'processing' : 'pending'
    },
    {
      key: 'security',
      label: 'Verificação de Segurança',
      icon: <Security />,
      color: theme.palette.info.main,
      status: isConnected ? 'completed' : isConnecting ? 'processing' : 'pending'
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
            Integração Blockchain
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

      <Box sx={{ mb: 4 }}>
        {connectionSteps.map((step, index) => (
          <Box
            key={step.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: index < connectionSteps.length - 1 ? 2 : 0,
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
                background: alpha(step.color, 0.1),
                color: step.color,
              }}
            >
              {step.icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: step.color,
                    fontWeight: 500,
                  }}
                >
                  {step.label}
                </Typography>
                {step.status === 'completed' && (
                  <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 16 }} />
                )}
                {step.status === 'processing' && (
                  <CircularProgress size={16} sx={{ color: step.color }} />
                )}
              </Box>
              <LinearProgress
                variant={step.status === 'processing' ? 'indeterminate' : 'determinate'}
                value={step.status === 'completed' ? 100 : 0}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: alpha(step.color, 0.1),
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${step.color}, ${alpha(step.color, 0.5)})`,
                  },
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>

      {networkInfo && contractInfo && (
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 500,
              }}
            >
              Detalhes da Conexão
            </Typography>
            <Tooltip title={showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}>
              <IconButton
                size="small"
                onClick={() => setShowDetails(!showDetails)}
                sx={{
                  color: theme.palette.primary.main,
                }}
              >
                {showDetails ? <Info /> : <Info />}
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                >
                  Rede
                </Typography>
                <Chip
                  icon={<Link />}
                  label={networkInfo.networkName}
                  sx={{
                    background: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    '& .MuiChip-icon': {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              </Grid>
              {showDetails && (
                <>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: theme.palette.primary.main,
                        mb: 1,
                      }}
                    >
                      Informações da Rede
                    </Typography>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        background: alpha(theme.palette.background.paper, 0.5),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                      }}
                    >
                      <Box>Chain ID: {networkInfo.chainId}</Box>
                      <Box>RPC URL: {networkInfo.rpcUrl}</Box>
                      <Box>Explorer: {networkInfo.blockExplorer}</Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: theme.palette.primary.main,
                        mb: 1,
                      }}
                    >
                      Informações do Contrato
                    </Typography>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        background: alpha(theme.palette.background.paper, 0.5),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                      }}
                    >
                      <Box>Nome: {contractInfo.name}</Box>
                      <Box>Símbolo: {contractInfo.symbol}</Box>
                      <Box>Decimais: {contractInfo.decimals}</Box>
                      <Box>Endereço: {contractInfo.address}</Box>
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Box>
      )}

      <Button
        variant="contained"
        onClick={onConnect}
        disabled={isConnecting}
        startIcon={isConnecting ? <CircularProgress size={20} /> : <SwapHoriz />}
        fullWidth
        sx={{
          py: 1.5,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          '&:hover': {
            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
          },
          '&.Mui-disabled': {
            background: alpha(theme.palette.primary.main, 0.3),
          },
        }}
      >
        {isConnecting ? 'Conectando...' : isConnected ? 'Reconectar' : 'Conectar à Blockchain'}
      </Button>
    </Paper>
  );
};

export default BlockchainIntegration; 