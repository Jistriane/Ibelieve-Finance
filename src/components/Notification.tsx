import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  alpha,
  IconButton,
  Collapse,
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Close,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  details,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          setTimeout(onClose, 300); // Aguarda a animação de saída
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle />,
          color: theme.palette.success.main,
          gradient: `linear-gradient(90deg, ${theme.palette.success.main}, ${alpha(theme.palette.success.main, 0.5)})`
        };
      case 'error':
        return {
          icon: <Error />,
          color: theme.palette.error.main,
          gradient: `linear-gradient(90deg, ${theme.palette.error.main}, ${alpha(theme.palette.error.main, 0.5)})`
        };
      case 'warning':
        return {
          icon: <Warning />,
          color: theme.palette.warning.main,
          gradient: `linear-gradient(90deg, ${theme.palette.warning.main}, ${alpha(theme.palette.warning.main, 0.5)})`
        };
      case 'info':
        return {
          icon: <Info />,
          color: theme.palette.info.main,
          gradient: `linear-gradient(90deg, ${theme.palette.info.main}, ${alpha(theme.palette.info.main, 0.5)})`
        };
      default:
        return {
          icon: <Info />,
          color: theme.palette.info.main,
          gradient: `linear-gradient(90deg, ${theme.palette.info.main}, ${alpha(theme.palette.info.main, 0.5)})`
        };
    }
  };

  const typeConfig = getTypeConfig(type);

  return (
    <Collapse in={isVisible}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(typeConfig.color, 0.2)}`,
          position: 'relative',
          overflow: 'hidden',
          mb: 2,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: typeConfig.gradient,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: alpha(typeConfig.color, 0.1),
              color: typeConfig.color,
              flexShrink: 0,
            }}
          >
            {typeConfig.icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: typeConfig.color,
                  fontWeight: 600,
                }}
              >
                {title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {details && (
                  <Tooltip title={showDetails ? "Ocultar detalhes" : "Mostrar detalhes"}>
                    <IconButton
                      size="small"
                      onClick={() => setShowDetails(!showDetails)}
                      sx={{
                        color: alpha(typeConfig.color, 0.7),
                        '&:hover': {
                          color: typeConfig.color,
                        },
                      }}
                    >
                      {showDetails ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Tooltip>
                )}
                {onClose && (
                  <Tooltip title="Fechar">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                      }}
                      sx={{
                        color: alpha(typeConfig.color, 0.7),
                        '&:hover': {
                          color: typeConfig.color,
                        },
                      }}
                    >
                      <Close />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.primary,
              }}
            >
              {message}
            </Typography>
            {details && (
              <Collapse in={showDetails}>
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    borderRadius: 1,
                    background: alpha(typeConfig.color, 0.05),
                    border: `1px solid ${alpha(typeConfig.color, 0.1)}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {details}
                  </Typography>
                </Box>
              </Collapse>
            )}
          </Box>
        </Box>
      </Paper>
    </Collapse>
  );
};

export default Notification; 