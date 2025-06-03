import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Select, MenuItem, Typography, Box } from '@mui/material';
import { useWallet } from '../../hooks/useWallet';
import { WalletType } from '../../utils/types';

const WalletConnect: React.FC = () => {
  const [selectedWallet, setSelectedWallet] = useState<WalletType>('metamask');
  const { connect, disconnect, isConnected, address } = useWallet();

  const handleWalletChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedWallet(event.target.value as WalletType);
  };

  const handleConnect = async () => {
    try {
      await connect(selectedWallet);
    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Conectar Carteira
      </Typography>
      
      <Select
        value={selectedWallet}
        onChange={handleWalletChange}
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="metamask">MetaMask</MenuItem>
        <MenuItem value="subwallet">SubWallet</MenuItem>
      </Select>

      {!isConnected ? (
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnect}
          fullWidth
        >
          Conectar
        </Button>
      ) : (
        <Box>
          <Typography variant="body2" gutterBottom>
            Carteira Conectada: {address}
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleDisconnect}
            fullWidth
          >
            Desconectar
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default WalletConnect; 