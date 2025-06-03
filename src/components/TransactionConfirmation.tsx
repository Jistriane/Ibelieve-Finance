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
  IconButton,
  Button
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Pending,
  Info,
  ContentCopy,
  OpenInNew,
  Timer
} from '@mui/icons-material';

interface TransactionConfirmationProps {
  transaction: {
    hash: string;
    status: 'pending' | 'confirmed' | 'failed';
    confirmations: number;
    blockNumber?: number;
    timestamp: number;
    from: string;
    to: string;
    value: string;
    gasUsed: string;
    gasPrice: string;
  };
  isLoading?: boolean;
  onViewExplorer?: () => void;
}

const TransactionConfirmation: React.FC<TransactionConfirmationProps> = ({
  transaction,
  isLoading,
  onViewExplorer
}) => {
  const theme = useTheme();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: <CheckCircle />,
          color: theme.palette.success.main,
          label: 'Confirmada',
          message: 'Transação confirmada com sucesso'
        };
      case 'pending':
        return {
          icon: <Pending />,
          color: theme.palette.warning.main,
          label: 'Pendente',
          message: 'Aguardando confirmações'
        };
      case 'failed':
        return {
          icon: <Error />,
          color: theme.palette.error.main,
          label: 'Falhou',
          message: 'Transação falhou'
        };
      default:
        return {
          icon: <Info />,
          color: theme.palette.info.main,
          label: 'Desconhecido',
          message: 'Status desconhecido'
        };
    }
  };

  const statusConfig = getStatusConfig(transaction.status);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const details = [
    {
      key: 'from',
      label: 'De',
      value: formatAddress(transaction.from),
      fullValue: transaction.from,
      icon: <Info />,
      color: theme.palette.primary.main
    },
    {
      key: 'to',
      label: 'Para',
      value: formatAddress(transaction.to),
      fullValue: transaction.to,
      icon: <Info />,
      color: theme.palette.secondary.main
    },
    {
      key: 'value',
      label: 'Valor',
      value: transaction.value,
      icon: <Info />,
      color: theme.palette.info.main
    },
    {
      key: 'gas',
      label: 'Gás',
      value: `${transaction.gasUsed} (${transaction.gasPrice})`,
      icon: <Info />,
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
            background: alpha(statusConfig.color, 0.1),
            color: statusConfig.color,
          }}
        >
          {statusConfig.icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            sx={{
              color: statusConfig.color,
              fontWeight: 600,
            }}
          >
            {statusConfig.label}
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
        {onViewExplorer && (
          <Button
            variant="outlined"
            startIcon={<OpenInNew />}
            onClick={onViewExplorer}
            sx={{
              borderColor: alpha(theme.palette.primary.main, 0.5),
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                background: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            Ver no Explorer
          </Button>
        )}
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: alpha(theme.palette.background.paper, 0.5),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: theme.palette.text.secondary,
                }}
              >
                Hash da Transação:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.primary,
                  fontFamily: 'monospace',
                }}
              >
                {formatAddress(transaction.hash)}
              </Typography>
              <Tooltip title="Copiar hash">
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(transaction.hash)}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            {transaction.status === 'pending' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timer sx={{ color: theme.palette.warning.main }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.warning.main,
                  }}
                >
                  {transaction.confirmations} confirmações
                </Typography>
              </Box>
            )}
          </Box>

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
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.text.primary,
                        fontFamily: detail.key === 'value' ? 'monospace' : 'inherit',
                      }}
                    >
                      {detail.value}
                    </Typography>
                    {detail.fullValue && (
                      <Tooltip title="Copiar endereço">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(detail.fullValue!)}
                          sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              color: detail.color,
                            },
                          }}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Paper>
  );
};

export default TransactionConfirmation; 