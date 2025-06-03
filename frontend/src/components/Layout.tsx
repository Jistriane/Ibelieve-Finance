import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import WalletConnect from './wallet/WalletConnect';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
            Ibelieve Finance
          </Typography>
          <Button
            color="inherit"
            component={RouterLink}
            to="/loans"
            sx={{ mx: 1 }}
          >
            Empréstimos
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/about"
            sx={{ mx: 1 }}
          >
            Sobre
          </Button>
          <WalletConnect />
          <ThemeToggle />
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Ibelieve Finance. Todos os direitos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 