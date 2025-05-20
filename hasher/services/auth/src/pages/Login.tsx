import React from 'react';
import LoginForm from '../components/LoginForm';
import WalletLogin from '../components/WalletLogin';
import { Container, Typography, Divider } from '@mui/material';

export default function Login() {
  return (
    <Container maxWidth="xs" style={{ marginTop: 40 }}>
      <Typography variant="h4" align="center" gutterBottom>Login</Typography>
      <LoginForm />
      <Divider style={{ margin: '24px 0' }}>ou</Divider>
      <WalletLogin />
    </Container>
  );
} 