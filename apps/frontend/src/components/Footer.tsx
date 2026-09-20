import { Box, Divider, Typography } from '@mui/material';

export function Footer() {
  return (
    <Box component="footer" sx={{ mt: 'auto', py: 4, px: 2, textAlign: 'center' }}>
      <Divider sx={{ mb: 2, opacity: 0.6 }} />
      <Typography variant="body2" color="text.secondary">
        BloomStore · ORT diploma project · {new Date().getFullYear()}
      </Typography>
    </Box>
  );
}
