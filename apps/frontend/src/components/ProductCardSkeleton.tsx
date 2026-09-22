import { Card, CardContent, Skeleton, Stack } from '@mui/material';

export function ProductCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }}>
      <Skeleton variant="rectangular" sx={{ height: { xs: 220, sm: 248, md: 280 } }} animation="wave" />
      <CardContent>
        <Skeleton width="34%" height={18} sx={{ mb: 1.5 }} animation="wave" />
        <Skeleton width="78%" height={28} animation="wave" />
        <Skeleton width="92%" animation="wave" />
        <Skeleton width="64%" animation="wave" />
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Skeleton width={72} height={28} animation="wave" />
          <Skeleton width={88} height={20} animation="wave" />
        </Stack>
      </CardContent>
    </Card>
  );
}
