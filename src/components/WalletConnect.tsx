import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  IconButton,
  Tooltip
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { setWalletAddress, setWalletType } from '../store/slices/walletSlice';
import { AccountBalanceWallet, Close } from '@mui/icons-material';

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const dispatch = useDispatch();
  const theme = useTheme();

  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        const address = accounts[0];
        setAddress(address);
        setIsConnected(true);
        dispatch(setWalletAddress(address));
        dispatch(setWalletType('metamask'));
        onConnect(address);
        setOpenDialog(false);
      } else {
        alert('Por favor, instale a MetaMask!');
      }
    } catch (error) {
      console.error('Erro ao conectar MetaMask:', error);
    }
  };

  const connectSubWallet = async () => {
    try {
      if (typeof window.SubWallet !== 'undefined') {
        const accounts = await window.SubWallet.enable();
        const address = accounts[0];
        setAddress(address);
        setIsConnected(true);
        dispatch(setWalletAddress(address));
        dispatch(setWalletType('subwallet'));
        onConnect(address);
        setOpenDialog(false);
      } else {
        alert('Por favor, instale a SubWallet!');
      }
    } catch (error) {
      console.error('Erro ao conectar SubWallet:', error);
    }
  };

  const disconnectWallet = () => {
    setAddress('');
    setIsConnected(false);
    dispatch(setWalletAddress(''));
    dispatch(setWalletType(''));
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {!isConnected ? (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
          startIcon={<AccountBalanceWallet />}
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            },
          }}
        >
          Conectar Carteira
        </Button>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1,
            borderRadius: 2,
            background: alpha(theme.palette.primary.main, 0.1),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 500,
            }}
          >
            {formatAddress(address)}
          </Typography>
          <Tooltip title="Desconectar">
            <IconButton
              onClick={disconnectWallet}
              size="small"
              sx={{
                color: theme.palette.error.main,
                '&:hover': {
                  background: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <Close />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          Escolha sua Carteira
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={connectMetaMask}
              fullWidth
              startIcon={<AccountBalanceWallet />}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
              }}
            >
              MetaMask
            </Button>
            <Button
              variant="contained"
              onClick={connectSubWallet}
              fullWidth
              startIcon={<AccountBalanceWallet />}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.primary.dark})`,
                },
              }}
            >
              SubWallet
            </Button>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletConnect; 