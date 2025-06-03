import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Button,
  Box,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Alert,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { connectWallet, disconnectWallet } from '../../store/walletSlice';

const WalletConnect: React.FC = () => {
  const dispatch = useDispatch();
  const { address, isConnecting, error } = useSelector((state: RootState) => state.wallet);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleConnect = async (walletType: 'metamask' | 'subwallet') => {
    try {
      await dispatch(connectWallet(walletType));
      setAnchorEl(null);
    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
    }
  };

  const handleDisconnect = () => {
    dispatch(disconnectWallet());
    setAnchorEl(null);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!address ? (
        <Button
          variant="contained"
          startIcon={<WalletIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          disabled={isConnecting}
          color="primary"
        >
          {isConnecting ? 'Conectando...' : 'Conectar Carteira'}
        </Button>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<WalletIcon />}
            label={formatAddress(address)}
            color="primary"
            variant="outlined"
          />
          <Tooltip title="Desconectar">
            <IconButton onClick={handleDisconnect} color="primary">
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleConnect('metamask')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src="/metamask-fox.svg" alt="MetaMask" style={{ width: 24, height: 24 }} />
            MetaMask
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleConnect('subwallet')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src="/subwallet-logo.svg" alt="SubWallet" style={{ width: 24, height: 24 }} />
            SubWallet
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default WalletConnect; 