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
  Verified,
  Security,
  Lock,
  CheckCircle,
  Error,
  Info,
  Key,
  Fingerprint
} from '@mui/icons-material';

interface ZKPVerificationProps {
  onVerify: () => Promise<void>;
  isVerifying: boolean;
  isVerified: boolean;
  proofData?: {
    proof: string;
    publicInputs: string[];
    verificationResult: boolean;
  };
}

const ZKPVerification: React.FC<ZKPVerificationProps> = ({
  onVerify,
  isVerifying,
  isVerified,
  proofData
}) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  const getStatusConfig = () => {
    if (isVerifying) {
      return {
        icon: <CircularProgress size={24} />,
        color: theme.palette.info.main,
        label: 'Verificando',
        message: 'Processando prova zero-knowledge...'
      };
    }
    if (isVerified) {
      return {
        icon: <Verified />,
        color: theme.palette.success.main,
        label: 'Verificado',
        message: 'Prova zero-knowledge verificada com sucesso'
      };
    }
    return {
      icon: <Security />,
      color: theme.palette.warning.main,
      label: 'Não Verificado',
      message: 'Aguardando verificação da prova zero-knowledge'
    };
  };

  const statusConfig = getStatusConfig();

  const verificationSteps = [
    {
      key: 'proof',
      label: 'Geração da Prova',
      icon: <Key />,
      color: theme.palette.primary.main,
      status: isVerified ? 'completed' : isVerifying ? 'processing' : 'pending'
    },
    {
      key: 'verification',
      label: 'Verificação',
      icon: <Fingerprint />,
      color: theme.palette.secondary.main,
      status: isVerified ? 'completed' : isVerifying ? 'processing' : 'pending'
    },
    {
      key: 'confirmation',
      label: 'Confirmação',
      icon: <Lock />,
      color: theme.palette.info.main,
      status: isVerified ? 'completed' : isVerifying ? 'processing' : 'pending'
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
            Verificação ZKP
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
        {verificationSteps.map((step, index) => (
          <Box
            key={step.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: index < verificationSteps.length - 1 ? 2 : 0,
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

      {proofData && (
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
              Detalhes da Prova
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
                  Resultado da Verificação
                </Typography>
                <Chip
                  icon={proofData.verificationResult ? <CheckCircle /> : <Error />}
                  label={proofData.verificationResult ? 'Válido' : 'Inválido'}
                  sx={{
                    background: proofData.verificationResult
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.error.main, 0.1),
                    color: proofData.verificationResult
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                    '& .MuiChip-icon': {
                      color: proofData.verificationResult
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
                      Prova
                    </Typography>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        background: alpha(theme.palette.background.paper, 0.5),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        wordBreak: 'break-all',
                      }}
                    >
                      {proofData.proof}
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
                      Inputs Públicos
                    </Typography>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        background: alpha(theme.palette.background.paper, 0.5),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        wordBreak: 'break-all',
                      }}
                    >
                      {proofData.publicInputs.join(', ')}
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
        onClick={onVerify}
        disabled={isVerifying}
        startIcon={isVerifying ? <CircularProgress size={20} /> : <Security />}
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
        {isVerifying ? 'Verificando...' : 'Verificar Prova ZKP'}
      </Button>
    </Paper>
  );
};

export default ZKPVerification; 