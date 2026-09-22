import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useId, useState, type FormEvent } from 'react';
import { stockAlertSchema, type StockAlertDto } from '@bloomstore/shared-types';
import { api, unwrap } from '../services/api';
import { fieldErrorsFromZod, emailInputAttrs } from '../utils/form';

type StockNotifyFormProps = {
  productId: string;
  defaultEmail?: string;
  compact?: boolean;
};

export function StockNotifyForm({ productId, defaultEmail = '', compact = false }: StockNotifyFormProps) {
  const fieldId = useId();
  const [email, setEmail] = useState(defaultEmail);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [done, setDone] = useState<StockAlertDto | null>(null);

  useEffect(() => {
    if (defaultEmail) {
      setEmail((current) => current || defaultEmail);
    }
  }, [defaultEmail]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const parsed = stockAlertSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(fieldErrorsFromZod(parsed.error).email);
      return;
    }
    setFieldError(undefined);
    setSubmitting(true);
    try {
      const result = await unwrap<StockAlertDto>(
        api.post(`/products/${productId}/stock-alerts`, { email: parsed.data.email }),
      );
      setDone(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Alert severity="success">
        {done.alreadySubscribed
          ? `You're already on the list. We'll email you when it's back.`
          : `We'll email ${email} when this bouquet is back in stock.`}
      </Alert>
    );
  }

  return (
    <Stack spacing={compact ? 1 : 1.5} id={compact ? undefined : 'notify'} sx={{ width: '100%' }}>
      {!compact && (
        <Typography color="text.secondary">
          This bouquet is out of stock. Leave your email and we’ll write when it returns.
        </Typography>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      <Stack
        component="form"
        method="post"
        autoComplete="on"
        direction={{ xs: 'column', sm: compact ? 'column' : 'row' }}
        spacing={1.25}
        alignItems={{ sm: compact ? 'stretch' : 'flex-start' }}
        onSubmit={(e) => void onSubmit(e)}
      >
        <TextField
          id={fieldId}
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          size={compact ? 'small' : 'medium'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(fieldError)}
          helperText={fieldError}
          required
          fullWidth
          slotProps={{ htmlInput: emailInputAttrs }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          sx={{ flexShrink: 0, mt: { sm: compact ? 0 : 0.5 }, alignSelf: { xs: 'stretch', sm: compact ? 'stretch' : 'flex-start' } }}
        >
          {submitting ? 'Saving…' : 'Email me'}
        </Button>
      </Stack>
    </Stack>
  );
}
