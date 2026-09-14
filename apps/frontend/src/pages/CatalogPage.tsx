import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { PRODUCT_CATEGORIES, type ProductDto } from '@bloomstore/shared-types';
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
    <Container className="py-8">
      <Box className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography variant="h4">Flower shop catalog</Typography>
          <Typography color="text.secondary">
            Inactive and out-of-stock arrangements are hidden automatically.
          </Typography>
        </div>
        <Select
          size="small"
          displayEmpty
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
      </Box>
      {error && <Typography color="error">{error}</Typography>}
      {!error && products.length === 0 && (
        <Typography color="text.secondary">No bouquets available right now.</Typography>
      )}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardMedia component="img" height="200" image={product.imageUrl} alt={product.name} />
              <CardContent>
                <Chip size="small" label={product.category} className="mb-2" />
                <Typography variant="h6">{product.name}</Typography>
                <Typography color="text.secondary" className="line-clamp-2">
                  {product.description}
                </Typography>
                <Typography className="mt-2 font-semibold">₪{product.price}</Typography>
                <Typography variant="caption">In stock: {product.stock}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={RouterLink} to={`/products/${product.id}`}>
                  Details
                </Button>
                {user && (
                  <Button size="small" onClick={() => void upsert(product.id, 1)}>
                    Add to cart
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
