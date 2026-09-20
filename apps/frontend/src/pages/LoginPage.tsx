import { useState, type FormEvent } from 'react';
import { Alert, Button, Link, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { useAuth } from '../context/AuthContext';
import { ApiClientError } from '../services/api';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('customer@bloomstore.com');
  const [password, setPassword] = useState('Customer123!');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const ax = err as ApiClientError;
      setError(ax.code === 'ACCOUNT_LOCKED' ? 'Account locked (HTTP 423). Try again later.' : ax.message);
    }
  };

  return (
    <PageShell maxWidth="sm">
      <PageHeader title="Welcome back" subtitle="Sign in to manage your cart and orders." />
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack component="form" spacing={2} onSubmit={(e) => void onSubmit(e)}>
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" fullWidth>
            Sign in
          </Button>
        </Stack>
        <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
          New here?{' '}
          <Link component={RouterLink} to="/register" underline="hover">
            Create an account
          </Link>
        </Typography>
      </Paper>
    </PageShell>
  );
}
