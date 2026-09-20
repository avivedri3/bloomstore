import { useState, type FormEvent } from 'react';
import { Alert, Button, Link, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { registerSchema } from '@bloomstore/shared-types';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { useAuth } from '../context/AuthContext';
import { fieldErrorsFromZod } from '../utils/form';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const parsed = registerSchema.safeParse({ fullName, email, password });
    const nextErrors: Record<string, string> = parsed.success ? {} : fieldErrorsFromZod(parsed.error);
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    if (!parsed.success || nextErrors.confirmPassword) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register(parsed.data.fullName, parsed.data.email, parsed.data.password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell maxWidth="sm">
      <PageHeader title="Create account" subtitle="Join BloomStore to save addresses and track orders." />
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack component="form" spacing={2} autoComplete="on" onSubmit={(e) => void onSubmit(e)}>
          <TextField
            id="register-full-name"
            name="name"
            label="Full name"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={Boolean(fieldErrors.fullName)}
            helperText={fieldErrors.fullName}
            required
            fullWidth
          />
          <TextField
            id="register-email"
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            required
            fullWidth
            slotProps={{ htmlInput: { autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false } }}
          />
          <TextField
            id="register-password"
            name="new-password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password || 'At least 8 characters'}
            required
            fullWidth
            slotProps={{ htmlInput: { minLength: 8 } }}
          />
          <TextField
            id="register-confirm-password"
            name="confirm-password"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={Boolean(fieldErrors.confirmPassword)}
            helperText={fieldErrors.confirmPassword}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </Stack>
        <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" underline="hover">
            Sign in
          </Link>
        </Typography>
      </Paper>
    </PageShell>
  );
}
