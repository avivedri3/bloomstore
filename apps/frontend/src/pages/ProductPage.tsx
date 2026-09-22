import { Box, Button, Chip, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import type { ProductDto } from '@bloomstore/shared-types';
import { EmptyState } from '../components/layout/EmptyState';
import { PageShell } from '../components/layout/PageShell';
import { Price } from '../components/Price';
import { StockNotifyForm } from '../components/StockNotifyForm';
import { api, unwrap } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { bloomTokens } from '../theme/tokens';
import { CATEGORY_LABELS } from '../utils/categories';

function ProductPageSkeleton() {
  return (
    <PageShell maxWidth="md">
      <Skeleton width={140} height={28} sx={{ mb: 3 }} animation="wave" />
      <Grid container spacing={{ xs: 3, md: 5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" sx={{ height: { xs: 260, md: 480 }, borderRadius: 4 }} animation="wave" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton width={90} height={24} animation="wave" />
          <Skeleton width="80%" height={48} sx={{ mt: 2 }} animation="wave" />
          <Skeleton width="100%" sx={{ mt: 2 }} animation="wave" />
          <Skeleton width="90%" animation="wave" />
          <Skeleton width={120} height={40} sx={{ mt: 3 }} animation="wave" />
        </Grid>
      </Grid>
    </PageShell>
  );
}

export function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    unwrap<ProductDto>(api.get(`/products/${id}`))
      .then(setProduct)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!product || product.stock > 0) return;
    if (window.location.hash !== '#notify') return;
    document.getElementById('notify')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [product]);

  if (error) {
    return (
      <PageShell maxWidth="md">
        <EmptyState
          title="We couldn’t find that bouquet"
          description={error}
          action={
            <Button variant="contained" component={RouterLink} to="/">
              Back to catalog
            </Button>
          }
        />
      </PageShell>
    );
  }
  if (!product) {
    return <ProductPageSkeleton />;
  }

  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 3;

  return (
    <PageShell maxWidth="md">
      <Button
        component={RouterLink}
        to="/"
        startIcon={<ArrowBackRoundedIcon />}
        sx={{ mb: 3, color: 'text.secondary' }}
      >
        Back to catalog
      </Button>
      <Grid container spacing={{ xs: 3, md: 5 }} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            component="img"
            src={product.imageUrl}
            alt={product.name}
            sx={{
              width: '100%',
              height: { xs: 260, sm: 360, md: 480 },
              objectFit: 'cover',
              borderRadius: 4,
              display: 'block',
              boxShadow: bloomTokens.shadow.card,
              filter: outOfStock ? 'grayscale(0.3)' : undefined,
              opacity: outOfStock ? 0.88 : 1,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2.5} sx={{ pt: { md: 1 } }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label={CATEGORY_LABELS[product.category]}
                component={RouterLink}
                to={`/?category=${product.category}`}
                clickable
                sx={{ alignSelf: 'flex-start', bgcolor: 'background.paper' }}
              />
              {outOfStock && (
                <Chip size="small" label="Out of stock" sx={{ bgcolor: 'background.paper', fontWeight: 600 }} />
              )}
            </Stack>
            <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '1.85rem', md: '2.5rem' } }}>
              {product.name}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.05rem' }, lineHeight: 1.7 }}>
              {product.description}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="baseline">
              <Price value={product.price} variant="h4" />
              <Typography
                variant="body2"
                color={outOfStock ? 'text.secondary' : lowStock ? 'primary.dark' : 'text.secondary'}
                fontWeight={600}
              >
                {outOfStock ? 'Out of stock' : lowStock ? `Only ${product.stock} left` : `${product.stock} in stock`}
              </Typography>
            </Stack>
            {outOfStock ? (
              <StockNotifyForm productId={product.id} defaultEmail={user?.email ?? ''} />
            ) : (
              <Stack spacing={1.25}>
                <Button
                  variant="contained"
                  size="large"
                  disabled={adding}
                  sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, px: 4 }}
                  onClick={() => {
                    if (!user) {
                      navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
                      return;
                    }
                    setAddError(null);
                    setAdding(true);
                    void add(product.id)
                      .then(() => {
                        setAdded(true);
                        window.setTimeout(() => setAdded(false), 1600);
                      })
                      .catch((err: Error) => setAddError(err.message))
                      .finally(() => setAdding(false));
                  }}
                >
                  {adding ? 'Adding…' : added ? 'Added to cart' : 'Add to cart'}
                </Button>
                {addError && (
                  <Typography color="error" variant="body2">
                    {addError}
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>
        </Grid>
      </Grid>
    </PageShell>
  );
}
