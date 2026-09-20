import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { PRODUCT_CATEGORIES, type ProductDto } from '@bloomstore/shared-types';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { api, unwrap } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function CatalogPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [category, setCategory] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { upsert } = useCart();

  useEffect(() => {
    const query = category ? `?category=${category}` : '';
    unwrap<ProductDto[]>(api.get(`/products${query}`))
      .then(setProducts)
      .catch((e: Error) => setError(e.message));
  }, [category]);

  return (
    <PageShell>
      <PageHeader
        title="Flower shop catalog"
        subtitle="Inactive and out-of-stock arrangements are hidden automatically."
        action={
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="catalog-category">Category</InputLabel>
            <Select
              labelId="catalog-category"
              label="Category"
              value={category}
              onChange={(e) => setCategory(String(e.target.value))}
            >
              <MenuItem value="">All categories</MenuItem>
              {PRODUCT_CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {!error && products.length === 0 && (
        <Typography color="text.secondary">No bouquets available right now.</Typography>
      )}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia component="img" height="200" image={product.imageUrl} alt={product.name} />
              <CardContent sx={{ flex: 1 }}>
                <Chip size="small" label={product.category} sx={{ mb: 1.5 }} />
                <Typography variant="h6" component="h2" gutterBottom>
                  {product.name}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {product.description}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="baseline" sx={{ mt: 2 }}>
                  <Typography variant="h6" color="primary.main">
                    ₪{product.price}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    In stock: {product.stock}
                  </Typography>
                </Stack>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button size="small" component={RouterLink} to={`/products/${product.id}`}>
                  Details
                </Button>
                {user && (
                  <Button size="small" variant="contained" onClick={() => void upsert(product.id, 1)}>
                    Add to cart
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageShell>
  );
}
