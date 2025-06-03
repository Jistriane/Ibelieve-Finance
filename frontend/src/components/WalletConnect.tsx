import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

interface WalletProps {
  address: string;
}

interface WalletConnectProps {
  onConnect: () => void;
  onDisconnect: () => void;
  wallet: WalletProps;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, onDisconnect, wallet }) => {
  const { mode } = useTheme();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {wallet.address ? (
        <>
          <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
            {`${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onDisconnect}
            sx={{ ml: 2 }}
          >
            Desconectar
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={onConnect}
          sx={{ ml: 2 }}
        >
          Conectar Carteira
        </Button>
      )}
    </Box>
  );
};

export default WalletConnect; 