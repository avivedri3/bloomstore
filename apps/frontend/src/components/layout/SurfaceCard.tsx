import type { ReactNode } from 'react';
import { Paper, type PaperProps } from '@mui/material';
import { bloomTokens } from '../../theme/tokens';

type SurfaceCardProps = PaperProps & {
  children: ReactNode;
};

export function SurfaceCard({ children, sx, ...rest }: SurfaceCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: 2,
        borderRadius: 3,
        bgcolor: 'background.paper',
        boxShadow: bloomTokens.shadow.card,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Paper>
  );
}
