import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';
import { bloomTokens } from '../../theme/tokens';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
};

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Stack
      alignItems="center"
      spacing={1.75}
      sx={{
        py: { xs: 6, md: 9 },
        px: 3,
        textAlign: 'center',
        borderRadius: 4,
        bgcolor: 'background.paper',
        boxShadow: bloomTokens.shadow.card,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          backgroundColor: bloomTokens.color.roseLight,
          color: bloomTokens.color.roseDark,
        }}
      >
        {icon ?? <LocalFloristOutlinedIcon fontSize="large" />}
      </Box>
      <Typography variant="h6">{title}</Typography>
      {description && (
        <Typography color="text.secondary" sx={{ maxWidth: 400, lineHeight: 1.7 }}>
          {description}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
