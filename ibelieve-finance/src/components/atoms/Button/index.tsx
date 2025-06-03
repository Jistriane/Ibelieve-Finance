import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'color'> {
  loading?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  disabled = false,
  color = 'primary',
  ...props
}) => {
  return (
    <MuiButton
      color={color}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <CircularProgress
          size={24}
          color="inherit"
          sx={{ mx: 1 }}
        />
      ) : (
        children
      )}
    </MuiButton>
  );
}; 