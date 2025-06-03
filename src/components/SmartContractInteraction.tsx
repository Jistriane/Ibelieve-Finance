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
  LinearProgress,
  TextField
} from '@mui/material';
import {
  Code,
  Send,
  CheckCircle,
  Error,
  Info,
  Storage,
  Memory,
  Speed
} from '@mui/icons-material';

interface SmartContractInteractionProps {
  onExecute: (method: string, params: any[]) => Promise<void>;
  isExecuting: boolean;
  lastTransaction?: {
    hash: string;
    status: 'success' | 'error';
    method: string;
    params: any[];
  };
  availableMethods: {
    name: string;
    type: 'view' | 'write';
    params: {
      name: string;
      type: string;
    }[];
  }[];
}

const SmartContractInteraction: React.FC<SmartContractInteractionProps> = ({
  onExecute,
  isExecuting,
  lastTransaction,
  availableMethods
}) => {
  const theme = useTheme();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paramValues, setParamValues] = useState<{ [key: string]: string }>({});
  const [showDetails, setShowDetails] = useState(false);

  const getStatusConfig = () => {
    if (isExecuting) {
      return {
        icon: <CircularProgress size={24} />,
        color: theme.palette.info.main,
        label: 'Executando',
        message: 'Processando interação com o contrato inteligente...'
      };
    }
    if (lastTransaction) {
      return {
        icon: lastTransaction.status === 'success' ? <CheckCircle /> : <Error />,
        color: lastTransaction.status === 'success' ? theme.palette.success.main : theme.palette.error.main,
        label: lastTransaction.status === 'success' ? 'Sucesso' : 'Erro',
        message: lastTransaction.status === 'success' 
          ? 'Transação executada com sucesso'
          : 'Erro ao executar transação'
      };
    }
    return {
      icon: <Code />,
      color: theme.palette.warning.main,
      label: 'Pronto',
      message: 'Aguardando interação com o contrato inteligente'
    };
  };

  const statusConfig = getStatusConfig();

  const executionSteps = [
    {
      key: 'validation',
      label: 'Validação',
      icon: <Memory />,
      color: theme.palette.primary.main,
      status: isExecuting ? 'processing' : lastTransaction ? 'completed' : 'pending'
    },
    {
      key: 'execution',
      label: 'Execução',
      icon: <Storage />,
      color: theme.palette.secondary.main,
      status: isExecuting ? 'processing' : lastTransaction ? 'completed' : 'pending'
    },
    {
      key: 'confirmation',
      label: 'Confirmação',
      icon: <Speed />,
      color: theme.palette.info.main,
      status: isExecuting ? 'processing' : lastTransaction ? 'completed' : 'pending'
    }
  ];

  const handleMethodSelect = (methodName: string) => {
    setSelectedMethod(methodName);
    setParamValues({});
  };

  const handleParamChange = (paramName: string, value: string) => {
    setParamValues(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleExecute = () => {
    const method = availableMethods.find(m => m.name === selectedMethod);
    if (method) {
      const params = method.params.map(param => paramValues[param.name] || '');
      onExecute(method.name, params);
    }
  };

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
            Interação com Contrato
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
        {executionSteps.map((step, index) => (
          <Box
            key={step.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: index < executionSteps.length - 1 ? 2 : 0,
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

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="subtitle1"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 500,
            mb: 2,
          }}
        >
          Métodos Disponíveis
        </Typography>
        <Grid container spacing={2}>
          {availableMethods.map((method) => (
            <Grid item xs={12} sm={6} md={4} key={method.name}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: selectedMethod === method.name
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(
                    selectedMethod === method.name
                      ? theme.palette.primary.main
                      : theme.palette.divider,
                    0.2
                  )}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.05),
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                }}
                onClick={() => handleMethodSelect(method.name)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    size="small"
                    label={method.type}
                    sx={{
                      background: method.type === 'view'
                        ? alpha(theme.palette.info.main, 0.1)
                        : alpha(theme.palette.warning.main, 0.1),
                      color: method.type === 'view'
                        ? theme.palette.info.main
                        : theme.palette.warning.main,
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 500,
                    }}
                  >
                    {method.name}
                  </Typography>
                </Box>
                {method.params.length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Parâmetros: {method.params.map(p => p.name).join(', ')}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {selectedMethod && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 500,
              mb: 2,
            }}
          >
            Parâmetros
          </Typography>
          <Grid container spacing={2}>
            {availableMethods
              .find(m => m.name === selectedMethod)
              ?.params.map((param) => (
                <Grid item xs={12} sm={6} key={param.name}>
                  <TextField
                    fullWidth
                    label={param.name}
                    type={param.type === 'number' ? 'number' : 'text'}
                    value={paramValues[param.name] || ''}
                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: alpha(theme.palette.background.paper, 0.5),
                        '&:hover': {
                          '& > fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      },
                    }}
                  />
                </Grid>
              ))}
          </Grid>
        </Box>
      )}

      {lastTransaction && (
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
              Última Transação
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
                  Status
                </Typography>
                <Chip
                  icon={lastTransaction.status === 'success' ? <CheckCircle /> : <Error />}
                  label={lastTransaction.status === 'success' ? 'Sucesso' : 'Erro'}
                  sx={{
                    background: lastTransaction.status === 'success'
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.error.main, 0.1),
                    color: lastTransaction.status === 'success'
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                    '& .MuiChip-icon': {
                      color: lastTransaction.status === 'success'
                        ? theme.palette.success.main
                        : theme.palette.error.main,
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
                      Detalhes da Transação
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
                      <Box>Método: {lastTransaction.method}</Box>
                      <Box>Hash: {lastTransaction.hash}</Box>
                      <Box>Parâmetros: {JSON.stringify(lastTransaction.params)}</Box>
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
        onClick={handleExecute}
        disabled={isExecuting || !selectedMethod}
        startIcon={isExecuting ? <CircularProgress size={20} /> : <Send />}
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
        {isExecuting ? 'Executando...' : 'Executar Método'}
      </Button>
    </Paper>
  );
};

export default SmartContractInteraction; 