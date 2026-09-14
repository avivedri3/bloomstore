import { useState, type FormEvent } from 'react';
import { Alert, Button, Container, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
    <Container className="py-10 max-w-md">
      <Typography variant="h4" className="mb-4">
        Register
      </Typography>
      {error && (
        <Alert severity="error" className="mb-3">
          {error}
        </Alert>
      )}
      <form className="flex flex-col gap-3" onSubmit={(e) => void onSubmit(e)}>
        <TextField label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained">
          Create account
        </Button>
      </form>
    </Container>
  );
}
