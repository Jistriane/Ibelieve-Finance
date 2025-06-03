import React from 'react';
import { Button } from '../../atoms/Button';
import { Typography } from '../../atoms/Typography';
import { Box } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

interface WalletConnectProps {
  address: string | null;
  onConnect: () => Promise<void>;
  loading?: boolean;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  address,
  onConnect,
  loading = false,
}) => {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {address ? (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {formatAddress(address)}
        </Typography>
      ) : (
        <Button
          variant="contained"
          onClick={onConnect}
          loading={loading}
          startIcon={<AccountBalanceWalletIcon />}
        >
          Conectar Carteira
        </Button>
      )}
    </Box>
  );
};
