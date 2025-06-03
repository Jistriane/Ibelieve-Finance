import React, { Component, ErrorInfo } from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  alpha,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh,
  BugReport,
  ContentCopy,
  Info
} from '@mui/icons-material';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    // Aqui você pode adicionar lógica para enviar o erro para um serviço de monitoramento
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  copyErrorDetails = () => {
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack
    };
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.9)}, ${alpha(theme.palette.background.default, 0.7)})`,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              maxWidth: 600,
              width: '100%',
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
              backdropFilter: 'blur(10px)',
              border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: (theme) => `linear-gradient(90deg, ${theme.palette.error.main}, ${alpha(theme.palette.error.main, 0.5)})`,
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
                  background: (theme) => alpha(theme.palette.error.main, 0.1),
                  color: (theme) => theme.palette.error.main,
                }}
              >
                <ErrorIcon />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: (theme) => theme.palette.error.main,
                    fontWeight: 600,
                  }}
                >
                  Ops! Algo deu errado
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: (theme) => theme.palette.text.secondary,
                  }}
                >
                  Encontramos um problema inesperado
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: (theme) => alpha(theme.palette.error.main, 0.05),
                border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                mb: 3,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: (theme) => theme.palette.error.main,
                  mb: 1,
                }}
              >
                Detalhes do Erro:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: (theme) => theme.palette.text.primary,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error?.message}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleRefresh}
                sx={{
                  background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
                  '&:hover': {
                    background: (theme) => `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.primary.main, 0.7)})`,
                  },
                }}
              >
                Tentar Novamente
              </Button>
              <Tooltip title="Copiar detalhes do erro">
                <IconButton
                  onClick={this.copyErrorDetails}
                  sx={{
                    color: (theme) => theme.palette.text.secondary,
                    '&:hover': {
                      color: (theme) => theme.palette.primary.main,
                    },
                  }}
                >
                  <ContentCopy />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reportar problema">
                <IconButton
                  onClick={() => window.open('https://github.com/seu-repo/issues', '_blank')}
                  sx={{
                    color: (theme) => theme.palette.text.secondary,
                    '&:hover': {
                      color: (theme) => theme.palette.primary.main,
                    },
                  }}
                >
                  <BugReport />
                </IconButton>
              </Tooltip>
            </Box>

            {this.state.errorInfo && (
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: (theme) => theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    const element = document.getElementById('error-stack');
                    if (element) {
                      element.style.display = element.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                >
                  <Info fontSize="small" />
                  Stack Trace
                </Typography>
                <Box
                  id="error-stack"
                  sx={{
                    display: 'none',
                    mt: 1,
                    p: 2,
                    borderRadius: 2,
                    background: (theme) => alpha(theme.palette.background.paper, 0.5),
                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: (theme) => theme.palette.text.primary,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 