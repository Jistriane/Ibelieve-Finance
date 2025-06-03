import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro capturado:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ my: 4, p: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom color="error">
                Ops! Algo deu errado.
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {this.state.error?.message || 'Ocorreu um erro inesperado.'}
              </Typography>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" component="pre" sx={{ overflow: 'auto' }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Box>
              )}
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.location.reload()}
                  sx={{ mr: 2 }}
                >
                  Recarregar Página
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                >
                  Tentar Novamente
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
} 