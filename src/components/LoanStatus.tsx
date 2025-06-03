import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  useTheme,
  alpha,
  Chip,
  Grid,
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Pending,
  AttachMoney,
  Timer,
  AccountBalance
} from '@mui/icons-material';

interface LoanStatusProps {
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  amount?: number;
  term?: number;
  message?: string;
}

const LoanStatus: React.FC<LoanStatusProps> = ({
  status,
  amount,
  term,
  message
}) => {
  const theme = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle />,
          color: theme.palette.success.main,
          label: 'Aprovado',
          message: 'Seu empréstimo foi aprovado com sucesso!'
        };
      case 'rejected':
        return {
          icon: <Error />,
          color: theme.palette.error.main,
          label: 'Rejeitado',
          message: message || 'Infelizmente seu empréstimo foi rejeitado.'
        };
      case 'processing':
        return {
          icon: <CircularProgress size={24} />,
          color: theme.palette.info.main,
          label: 'Processando',
          message: 'Estamos analisando sua solicitação...'
        };
      default:
        return {
          icon: <Pending />,
          color: theme.palette.warning.main,
          label: 'Pendente',
          message: 'Aguardando processamento...'
        };
    }
  };

  const statusConfig = getStatusConfig();

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: alpha(statusConfig.color, 0.1),
            color: statusConfig.color,
          }}
        >
          {statusConfig.icon}
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: statusConfig.color,
              fontWeight: 600,
            }}
          >
            {statusConfig.label}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            {statusConfig.message}
          </Typography>
        </Box>
      </Box>

      {(amount || term) && (
        <Grid container spacing={2}>
          {amount && (
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachMoney sx={{ color: theme.palette.primary.main }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ color: theme.palette.primary.main }}
                  >
                    Valor do Empréstimo
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                  }}
                >
                  R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Grid>
          )}

          {term && (
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: alpha(theme.palette.secondary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Timer sx={{ color: theme.palette.secondary.main }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ color: theme.palette.secondary.main }}
                  >
                    Prazo
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                  }}
                >
                  {term} {term === 1 ? 'mês' : 'meses'}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {status === 'approved' && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            background: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <AccountBalance sx={{ color: theme.palette.success.main }} />
          <Typography
            variant="body2"
            sx={{ color: theme.palette.success.main }}
          >
            O valor será creditado em sua carteira em até 24 horas.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default LoanStatus; 