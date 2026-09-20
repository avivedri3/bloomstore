import { Box, CircularProgress } from '@mui/material';

export function PageLoading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
      <CircularProgress color="primary" />
    </Box>
  );
}
