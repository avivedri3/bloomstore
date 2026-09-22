import { useEffect, useState } from 'react';
import { Button, Grid, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { type ProductDto } from '@bloomstore/shared-types';
import { CatalogHero } from '../components/CatalogHero';
import { CategoryPills } from '../components/CategoryPills';
import { EmptyState } from '../components/layout/EmptyState';
import { PageShell } from '../components/layout/PageShell';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { api, unwrap } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CATEGORY_LABELS, isProductCategory } from '../utils/categories';

export function CatalogPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const rawCategory = params.get('category') ?? '';
  const category = isProductCategory(rawCategory) ? rawCategory : '';
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
      return;
    }
    await add(productId);
  };

  useEffect(() => {
    const query = category ? `?category=${category}` : '';
    setLoading(true);
    unwrap<ProductDto[]>(api.get(`/products${query}`))
      .then(setProducts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <>
      {category ? (
        <PageShell sx={{ pb: 0, pt: { xs: 4, md: 6 } }}>
          <Stack alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1} textAlign={{ md: 'center' }}>
            <Typography variant="overline" color="primary.main" sx={{ letterSpacing: '0.2em' }}>
              Collection
            </Typography>
            <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 500 }}>
              {CATEGORY_LABELS[category]}
            </Typography>
          </Stack>
        </PageShell>
      ) : (
        <CatalogHero />
      )}
      <PageShell id="shop" sx={{ scrollMarginTop: 96, pt: { xs: 4, md: 7 }, pb: { xs: 6, md: 10 } }}>
        {!category && (
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: 'block', textAlign: { md: 'center' }, mb: 1.5, letterSpacing: '0.2em' }}
          >
            The collection
          </Typography>
        )}
        <CategoryPills category={category} />
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {loading && (
          <Grid container spacing={{ xs: 2, md: 3.5 }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                <ProductCardSkeleton />
              </Grid>
            ))}
          </Grid>
        )}
        {!loading && !error && products.length === 0 && (
          <EmptyState
            title="No flowers in this collection"
            description="Try another category, or browse the full catalog."
            action={
              category ? (
                <Button variant="contained" onClick={() => setParams({})}>
                  All flowers
                </Button>
              ) : null
            }
          />
        )}
        {!loading && (
          <Grid container spacing={{ xs: 2, md: 3.5 }}>
            {products.map((product) => (
              <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  notifyEmail={user?.email ?? ''}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </PageShell>
    </>
  );
}
