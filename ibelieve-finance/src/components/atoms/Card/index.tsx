import React from 'react';
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  Skeleton,
  Box,
} from '@mui/material';

export interface CardProps extends MuiCardProps {
  loading?: boolean;
  minHeight?: number | string;
}

export const Card: React.FC<CardProps> = ({
  children,
  loading = false,
  minHeight = 100,
  ...props
}) => {
  if (loading) {
    return (
      <MuiCard {...props}>
        <CardContent>
          <Box sx={{ minHeight }}>
            <Skeleton variant="rectangular" height={minHeight} />
          </Box>
        </CardContent>
      </MuiCard>
    );
  }

  return (
    <MuiCard {...props}>
      <CardContent>
        <Box sx={{ minHeight }}>{children}</Box>
      </CardContent>
    </MuiCard>
  );
}; 