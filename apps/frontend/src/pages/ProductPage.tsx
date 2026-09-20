import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, CardMedia, Stack, Typography } from '@mui/material';
import type { ProductDto } from '@bloomstore/shared-types';
import { PageLoading } from '../components/layout/PageLoading';
import { PageShell } from '../components/layout/PageShell';
import { api, unwrap } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { upsert } = useCart();

  useEffect(() => {
    if (!id) return;
    unwrap<ProductDto>(api.get(`/products/${id}`))
      .then(setProduct)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <PageShell maxWidth="md">
        <Typography color="error">{error}</Typography>
      </PageShell>
    );
  }
  if (!product) {
    return <PageLoading />;
  }

  return (
    <PageShell maxWidth="md">
      <Card>
        <CardMedia
          component="img"
          image={product.imageUrl}
          alt={product.name}
          sx={{ height: { xs: 280, md: 420 }, objectFit: 'cover' }}
        />
        <Stack spacing={2} sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h4" component="h1">
            {product.name}
          </Typography>
          <Typography color="text.secondary">{product.description}</Typography>
          <Typography variant="h5" color="primary.main">
            ₪{product.price}
          </Typography>
          {user ? (
            <Button variant="contained" size="large" sx={{ alignSelf: 'flex-start' }} onClick={() => void upsert(product.id, 1)}>
              Add to cart
            </Button>
          ) : (
            <Typography color="text.secondary">Log in to add this bouquet to your cart.</Typography>
          )}
        </Stack>
      </Card>
    </PageShell>
  );
}
