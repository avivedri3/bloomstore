import { useState, type FormEvent } from 'react';
import { Alert, Button, Container, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
    <Container className="py-10 max-w-md">
      <Typography variant="h4" className="mb-4">
        Login
      </Typography>
      {error && (
        <Alert severity="error" className="mb-3">
          {error}
        </Alert>
      )}
      <form className="flex flex-col gap-3" onSubmit={(e) => void onSubmit(e)}>
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained">
          Sign in
        </Button>
      </form>
      <Typography className="mt-3">
        New here? <RouterLink to="/register">Create an account</RouterLink>
      </Typography>
    </Container>
  );
}
