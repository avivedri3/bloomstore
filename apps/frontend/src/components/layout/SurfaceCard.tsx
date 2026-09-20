import type { ReactNode } from 'react';
import { Paper, type PaperProps } from '@mui/material';

type SurfaceCardProps = PaperProps & {
  children: ReactNode;
};

export function SurfaceCard({ children, sx, ...rest }: SurfaceCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Paper>
  );
}
