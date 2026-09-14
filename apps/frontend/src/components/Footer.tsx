import { Box, Typography } from '@mui/material';

export function Footer() {
  return (
    <Box component="footer" className="mt-auto py-6 text-center text-slate-600">
      <Typography variant="body2">BloomStore · ORT diploma project · {new Date().getFullYear()}</Typography>
    </Box>
  );
}
