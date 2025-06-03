import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  useTheme,
  alpha
} from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  thickness?: number;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Carregando...',
  size = 40,
  thickness = 4,
  color = 'primary'
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 4,
        borderRadius: 4,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette[color].main}, ${alpha(theme.palette[color].main, 0.5)})`,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
        }}
      >
        <CircularProgress
          size={size}
          thickness={thickness}
          color={color}
          sx={{
            color: theme.palette[color].main,
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress
            size={size * 0.7}
            thickness={thickness}
            color={color}
            variant="determinate"
            value={100}
            sx={{
              color: alpha(theme.palette[color].main, 0.2),
              position: 'absolute',
            }}
          />
        </Box>
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          color: theme.palette[color].main,
          fontWeight: 500,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner; 