import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Container, Typography } from '@mui/material';
import type { ProductDto } from '@bloomstore/shared-types';
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
      <Container className="py-8">
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }
  if (!product) {
    return (
      <Container className="py-8">
        <Typography>Loading…</Typography>
      </Container>
    );
  }

  return (
    <Container className="py-8 max-w-3xl">
      <img src={product.imageUrl} alt={product.name} className="mb-4 w-full rounded-xl object-cover" />
      <Typography variant="h4">{product.name}</Typography>
      <Typography className="my-3">{product.description}</Typography>
      <Typography variant="h6">₪{product.price}</Typography>
      {user ? (
        <Button className="mt-4" variant="contained" onClick={() => void upsert(product.id, 1)}>
          Add to cart
        </Button>
      ) : (
        <Typography className="mt-4" color="text.secondary">
          Log in to add this bouquet to your cart.
        </Typography>
      )}
    </Container>
  );
}
