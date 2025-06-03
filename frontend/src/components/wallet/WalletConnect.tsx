import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Select, MenuItem, SelectChangeEvent, Tooltip } from '@mui/material';
import { useWallet } from '../../hooks/useWallet';
import { NotificationService } from '../../services/NotificationService';

export type WalletType = 'metamask' | 'subwallet';

interface WalletConnectProps {
  onConnect?: (wallet: WalletType) => void;
  onDisconnect?: () => void;
  wallet?: WalletType;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnect,
  onDisconnect,
  wallet: initialWallet,
}) => {
  const { connect, disconnect, address, isConnected, provider } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<WalletType>(initialWallet || 'metamask');
  const [isSubWalletInstalled, setIsSubWalletInstalled] = useState(false);

  useEffect(() => {
    setIsSubWalletInstalled(!!window.subwallet);
  }, []);

  useEffect(() => {
    if (initialWallet) {
      setSelectedWallet(initialWallet);
    }
  }, [initialWallet]);

  const handleWalletChange = async (event: SelectChangeEvent) => {
    const wallet = event.target.value as WalletType;
    setSelectedWallet(wallet);

    try {
      await connect(wallet);
      if (onConnect) {
        onConnect(wallet);
      }
    } catch (error) {
      // Erro já tratado pelo NotificationService no hook useWallet
    }
  };

  const handleDisconnect = () => {
    disconnect();
    if (onDisconnect) {
      onDisconnect();
    }
  };

  if (isConnected && address) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title={address}>
          <Typography variant="body2" sx={{ color: 'white' }}>
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </Typography>
        </Tooltip>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleDisconnect}
          size="small"
        >
          Desconectar
        </Button>
      </Box>
    );
  }

  return (
    <Select
      value={selectedWallet}
      onChange={handleWalletChange}
      size="small"
      sx={{
        color: 'white',
        '.MuiOutlinedInput-notchedOutline': {
          borderColor: 'white',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'white',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'white',
        },
        '.MuiSvgIcon-root': {
          color: 'white',
        },
      }}
    >
      <MenuItem value="metamask">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src="/metamask-fox.svg" alt="MetaMask" style={{ width: 20, height: 20 }} />
          MetaMask
        </Box>
      </MenuItem>
      <MenuItem value="subwallet" disabled={!isSubWalletInstalled}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src="/subwallet-logo.svg" alt="SubWallet" style={{ width: 20, height: 20 }} />
          SubWallet
          {!isSubWalletInstalled && (
            <Typography variant="caption" color="error" sx={{ ml: 1 }}>
              (Não instalado)
            </Typography>
          )}
        </Box>
      </MenuItem>
    </Select>
  );
};

export default WalletConnect; 