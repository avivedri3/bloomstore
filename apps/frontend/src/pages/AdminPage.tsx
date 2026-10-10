import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  ORDER_STATUSES,
  PRODUCT_CATEGORIES,
  canTransition,
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGE_MIME_TYPES,
  isProductImageMime,
  productInputSchema,
  type AdminStatsDto,
  type OrderDto,
  type OrderStatus,
  type ProductDto,
} from '@bloomstore/shared-types';
import { AdminStatsPanel } from '../components/AdminStatsPanel';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { SurfaceCard } from '../components/layout/SurfaceCard';
import { StatusChip } from '../components/StatusChip';
import { api, unwrap } from '../services/api';
import { fieldErrorsFromZod } from '../utils/form';

const emptyProductForm = {
  name: '',
  description: '',
  category: 'bouquets' as (typeof PRODUCT_CATEGORIES)[number],
  price: '',
  stock: '',
  isActive: true,
};

const productFieldsSchema = productInputSchema.omit({ imageUrl: true });

function imageFieldError(file: File): string | null {
  if (!isProductImageMime(file.type)) {
    return 'Upload a JPEG, PNG, WebP, or GIF image';
  }
  if (file.size === 0) {
    return 'The image file is empty';
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return 'Image must be 5 MB or smaller';
  }
  return null;
}

export function AdminPage() {
  const [tab, setTab] = useState(0);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [status, setStatus] = useState<string>('');
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProductForm);
  const [editing, setEditing] = useState<ProductDto | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = () => unwrap<ProductDto[]>(api.get('/products/admin')).then(setProducts);
  const loadOrders = () =>
    unwrap<OrderDto[]>(api.get(`/orders/admin${status ? `?status=${status}` : ''}`)).then(setOrders);
  const loadStats = () =>
    unwrap<AdminStatsDto>(api.get('/admin/stats'))
      .then((data) => {
        setStats(data);
        setStatsError(null);
      })
      .catch((err: Error) => setStatsError(err.message));

  useEffect(() => {
    void loadProducts();
  }, []);

  useEffect(() => {
    if (tab === 2) {
      void loadStats();
    }
  }, [tab]);

  useEffect(() => {
    void loadOrders();
  }, [status]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyProductForm);
    setImageFile(null);
    setImageError(null);
    setFieldErrors({});
    setFormError(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const startEdit = (product: ProductDto) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      isActive: product.isActive,
    });
    setImageFile(null);
    setImageError(null);
    setFieldErrors({});
    setFormError(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const saveProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const imageProblem = imageFile ? imageFieldError(imageFile) : editing ? null : 'Choose an image file';
    const parsed = productFieldsSchema.safeParse({
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      isActive: form.isActive,
    });
    setImageError(imageProblem);
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
    } else {
      setFieldErrors({});
    }
    if (imageProblem || !parsed.success) {
      return;
    }
    const data = new FormData();
    data.append('name', parsed.data.name);
    data.append('description', parsed.data.description);
    data.append('category', parsed.data.category);
    data.append('price', String(parsed.data.price));
    data.append('stock', String(parsed.data.stock));
    if (imageFile) {
      data.append('image', imageFile);
    }
    setSubmitting(true);
    try {
      if (editing) {
        await unwrap(api.patch(`/products/${editing.id}`, data));
      } else {
        await unwrap(api.post('/products', data));
      }
      resetForm();
      await loadProducts();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <PageHeader eyebrow="Store" title="Admin" subtitle="Manage catalog, orders, and view store analytics." />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Products" />
        <Tab label="Orders" />
        <Tab label="Statistics" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Paper ref={formRef} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Stack component="form" method="post" spacing={2} autoComplete="off" onSubmit={(e) => void saveProduct(e)}>
              <Typography variant="h6">{editing ? `Edit ${editing.name}` : 'Add product'}</Typography>
              {formError && <Alert severity="error">{formError}</Alert>}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="product-name"
                    name="product-name"
                    fullWidth
                    required
                    label="Name"
                    autoComplete="off"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    error={Boolean(fieldErrors.name)}
                    helperText={fieldErrors.name}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="product-category"
                    name="product-category"
                    select
                    fullWidth
                    required
                    label="Category"
                    autoComplete="off"
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, category: e.target.value as (typeof PRODUCT_CATEGORIES)[number] }))
                    }
                    error={Boolean(fieldErrors.category)}
                    helperText={fieldErrors.category}
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={12}>
                  <TextField
                    id="product-description"
                    name="product-description"
                    fullWidth
                    required
                    multiline
                    minRows={2}
                    label="Description"
                    autoComplete="off"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    error={Boolean(fieldErrors.description)}
                    helperText={fieldErrors.description}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="product-price"
                    name="product-price"
                    fullWidth
                    required
                    label="Price"
                    type="number"
                    autoComplete="off"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    error={Boolean(fieldErrors.price)}
                    helperText={fieldErrors.price}
                    slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="product-stock"
                    name="product-stock"
                    fullWidth
                    required
                    label="Stock"
                    type="number"
                    autoComplete="off"
                    value={form.stock}
                    onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                    error={Boolean(fieldErrors.stock)}
                    helperText={fieldErrors.stock}
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  />
                </Grid>
                <Grid size={12}>
                  <Stack spacing={1}>
                    <Typography id="product-image-label" variant="subtitle2">
                      Product image
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                      <Button variant="outlined" component="label" sx={{ alignSelf: 'flex-start' }}>
                        Choose image
                        <input
                          ref={imageInputRef}
                          id="product-image"
                          name="product-image"
                          type="file"
                          accept={PRODUCT_IMAGE_MIME_TYPES.join(',')}
                          hidden
                          aria-labelledby="product-image-label"
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            setImageFile(file);
                            setImageError(file ? imageFieldError(file) : null);
                          }}
                        />
                      </Button>
                      <Typography variant="body2" color={imageError ? 'error' : 'text.secondary'}>
                        {imageError ??
                          (imageFile
                            ? imageFile.name
                            : editing
                              ? 'Choose a file only if you want to replace the current image.'
                              : 'JPEG, PNG, WebP, or GIF. Up to 5 MB.')}
                      </Typography>
                    </Stack>
                    {(previewUrl || editing?.imageUrl) && (
                      <Box
                        component="img"
                        src={previewUrl ?? editing?.imageUrl}
                        alt={editing ? editing.name : 'Selected product image'}
                        sx={{ width: 180, height: 120, objectFit: 'cover', borderRadius: 2 }}
                      />
                    )}
                  </Stack>
                </Grid>
              </Grid>
              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained" disabled={submitting} sx={{ alignSelf: 'flex-start' }}>
                  {submitting ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
                </Button>
                {editing && (
                  <Button type="button" variant="text" disabled={submitting} onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
          {products.map((p) => (
            <SurfaceCard key={p.id}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    component="img"
                    src={p.imageUrl}
                    alt=""
                    sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 1.5, flexShrink: 0 }}
                  />
                  <Typography>
                    {p.name} · ₪{p.price} · stock {p.stock} {p.stock === 0 ? '· out of stock' : ''}{' '}
                    {p.isActive ? '' : '(inactive)'}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant={editing?.id === p.id ? 'contained' : 'outlined'} onClick={() => startEdit(p)}>
                    Edit
                  </Button>
                  {p.stock === 0 ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        void unwrap(api.patch(`/products/${p.id}`, { stock: 12 })).then(loadProducts)
                      }
                    >
                      Restock
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() =>
                        void unwrap(api.patch(`/products/${p.id}`, { stock: 0 })).then(loadProducts)
                      }
                    >
                      Mark out of stock
                    </Button>
                  )}
                  <Button size="small" color="error" variant="outlined" onClick={() => void unwrap(api.delete(`/products/${p.id}`)).then(loadProducts)}>
                    Soft delete
                  </Button>
                </Stack>
              </Stack>
            </SurfaceCard>
          ))}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <TextField
            id="admin-order-status"
            name="order-status"
            select
            size="small"
            label="Status"
            autoComplete="off"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ mb: 3, minWidth: 220 }}
          >
            <MenuItem value="">all</MenuItem>
            {ORDER_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          {orders.map((order) => (
            <SurfaceCard key={order.id}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography fontWeight={700}>{order.orderNumber}</Typography>
                <StatusChip status={order.status} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                ₪{order.total}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {ORDER_STATUSES.filter((s) => canTransition(order.status, s as OrderStatus)).map((next) => (
                  <Button
                    key={next}
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      void unwrap(api.patch(`/orders/${order.id}/status`, { status: next })).then(loadOrders)
                    }
                  >
                    {next}
                  </Button>
                ))}
              </Stack>
            </SurfaceCard>
          ))}
        </Box>
      )}

      {tab === 2 && (
        <Box>
          {statsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {statsError}
            </Alert>
          )}
          {!stats && !statsError && (
            <Stack alignItems="center" sx={{ py: 6 }}>
              <CircularProgress />
            </Stack>
          )}
          {stats && <AdminStatsPanel stats={stats} />}
        </Box>
      )}
    </PageShell>
  );
}
