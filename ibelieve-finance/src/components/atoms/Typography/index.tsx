import React from 'react';
import {
  Typography as MuiTypography,
  TypographyProps as MuiTypographyProps,
} from '@mui/material';

export interface TypographyProps extends MuiTypographyProps {
  responsive?: boolean;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  responsive = false,
  variant = 'body1',
  ...props
}) => {
  const getResponsiveStyles = () => {
    if (!responsive) return {};

    switch (variant) {
      case 'h1':
        return {
          fontSize: {
            xs: '2rem',
            sm: '2.25rem',
            md: '2.5rem',
          },
        };
      case 'h2':
        return {
          fontSize: {
            xs: '1.75rem',
            sm: '1.875rem',
            md: '2rem',
          },
        };
      case 'h3':
        return {
          fontSize: {
            xs: '1.5rem',
            sm: '1.625rem',
            md: '1.75rem',
          },
        };
      default:
        return {};
    }
  };

  return (
    <MuiTypography
      variant={variant}
      sx={{ ...getResponsiveStyles(), ...props.sx }}
      {...props}
    >
      {children}
    </MuiTypography>
  );
}; 