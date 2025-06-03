import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Alternar para tema ${themeMode === 'light' ? 'escuro' : 'claro'}`}>
      <IconButton onClick={toggleTheme} color="inherit">
        {themeMode === 'light' ? (
          <Brightness4 data-testid="Brightness4Icon" />
        ) : (
          <Brightness7 data-testid="Brightness7Icon" />
        )}
      </IconButton>
    </Tooltip>
  );
}; 