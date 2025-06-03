import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { RootState } from '../../store';

const Settings = () => {
  const { address } = useSelector((state: RootState) => state.wallet);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoConnect: false,
  });
  const [openDialog, setOpenDialog] = useState(false);

  const handleChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [name]: event.target.checked,
    });
  };

  const handleSave = () => {
    // TODO: Implementar lógica de salvamento das configurações
    console.log('Configurações salvas:', settings);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (!address) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Conecte sua carteira para acessar as configurações
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configurações
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={handleChange('notifications')}
                />
              }
              label="Notificações"
            />

            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={handleChange('darkMode')}
                />
              }
              label="Modo Escuro"
            />

            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoConnect}
                  onChange={handleChange('autoConnect')}
                />
              }
              label="Conectar Automaticamente"
            />

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
              >
                Salvar Configurações
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Configurações Salvas</DialogTitle>
        <DialogContent>
          <Typography>
            Suas configurações foram salvas com sucesso!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 