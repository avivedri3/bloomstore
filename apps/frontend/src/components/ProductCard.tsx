import { useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, CardMedia, Chip, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { ProductDto } from '@bloomstore/shared-types';
import { bloomTokens } from '../theme/tokens';
import { CATEGORY_LABELS } from '../utils/categories';
import { Price } from './Price';
import { StockNotifyForm } from './StockNotifyForm';

type ProductCardProps = {
  product: ProductDto;
  onAddToCart: (productId: string) => void | Promise<void>;
  notifyEmail?: string;
};

export function ProductCard({ product, onAddToCart, notifyEmail = '' }: ProductCardProps) {
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 3;
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleAdd = async () => {
    setAddError(null);
    setAdding(true);
    try {
      await onAddToCart(product.id);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
    } catch (error) {
      setAddError((error as Error).message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '@media (hover: hover)': {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: bloomTokens.shadow.cardHover,
          },
          '&:hover .product-image': {
            transform: 'scale(1.04)',
          },
        },
      }}
    >
      <Box
        component={RouterLink}
        to={`/products/${product.id}`}
        sx={{ position: 'relative', overflow: 'hidden', display: 'block', color: 'inherit' }}
      >
        <CardMedia
          className="product-image"
          component="img"
          image={product.imageUrl}
          alt={product.name}
          sx={{
            height: { xs: 220, sm: 248, md: 280 },
            objectFit: 'cover',
            transition: 'transform 0.45s ease',
            filter: outOfStock ? 'grayscale(0.35)' : undefined,
            opacity: outOfStock ? 0.82 : 1,
          }}
        />
        <Chip
          size="small"
          label={CATEGORY_LABELS[product.category]}
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: 'background.paper',
            boxShadow: '0 4px 16px rgba(31, 41, 51, 0.12)',
          }}
        />
        {outOfStock && (
          <Chip
            size="small"
            label="Out of stock"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: 'background.paper',
              color: 'text.primary',
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(31, 41, 51, 0.12)',
            }}
          />
        )}
      </Box>
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' } }}>
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
            minHeight: { sm: 40 },
          }}
        >
          {product.description}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="baseline" sx={{ mt: 2 }}>
          <Price value={product.price} />
          <Typography
            variant="caption"
            color={outOfStock ? 'text.secondary' : lowStock ? 'primary.dark' : 'text.secondary'}
            fontWeight={600}
          >
            {outOfStock ? 'Out of stock' : lowStock ? `Only ${product.stock} left` : `${product.stock} in stock`}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1, flexDirection: outOfStock ? 'column' : 'row', alignItems: outOfStock ? 'stretch' : 'center' }}>
        <Button size="small" component={RouterLink} to={`/products/${product.id}`} sx={{ alignSelf: 'flex-start' }}>
          Details
        </Button>
        {outOfStock ? (
          <StockNotifyForm productId={product.id} defaultEmail={notifyEmail} compact />
        ) : (
          <Button size="small" variant="contained" disabled={adding} onClick={() => void handleAdd()}>
            {adding ? 'Adding…' : added ? 'Added' : 'Add to cart'}
          </Button>
        )}
      </CardActions>
      {addError && (
        <Typography color="error" variant="caption" sx={{ px: 2, pb: 1.5 }}>
          {addError}
        </Typography>
      )}
    </Card>
  );
}
