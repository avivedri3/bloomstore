import { useState, type FormEvent } from 'react';
import { Alert, Button, Link, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(fullName, email, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
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
        <Stack component="form" spacing={2} onSubmit={(e) => void onSubmit(e)}>
          <TextField label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required fullWidth />
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
            Create account
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
