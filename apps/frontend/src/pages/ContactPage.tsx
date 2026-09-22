import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Alert, Box, Button, Grid, Link, Stack, TextField, Typography } from '@mui/material';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { contactMessageSchema } from '@bloomstore/shared-types';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { SurfaceCard } from '../components/layout/SurfaceCard';
import { useAuth } from '../context/AuthContext';
import { bloomTokens } from '../theme/tokens';
import { fieldErrorsFromZod, emailInputAttrs } from '../utils/form';

const STUDIO = {
  address: '18 Rothschild Blvd, Tel Aviv',
  email: 'hello@bloomstore.com',
  phone: '+972-3-555-0148',
  hours: 'Sun–Thu 9:00–19:00 · Fri 9:00–14:00',
} as const;

export function ContactPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName((current) => current || user.fullName);
    setEmail((current) => current || user.email);
  }, [user]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = contactMessageSchema.safeParse({ fullName, email, message });
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      setSent(false);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSubmitting(false);
    setSent(true);
    setMessage('');
  };

  return (
    <PageShell maxWidth="md">
      <PageHeader
        eyebrow="Atelier"
        title="Contact us"
        subtitle="Tell us about an occasion, a custom bouquet, or a delivery — we’ll help you choose the right arrangement."
      />
      <Grid container spacing={{ xs: 2.5, md: 3.5 }} alignItems="stretch">
        <Grid size={{ xs: 12, md: 5 }}>
          <SurfaceCard sx={{ height: '100%', p: { xs: 3, sm: 3.5 } }}>
            <Typography variant="h6" sx={{ mb: 2.5 }}>
              The studio
            </Typography>
            <Stack spacing={2.25}>
              <ContactDetail
                icon={<PlaceOutlinedIcon fontSize="small" />}
                label="Visit"
                value={STUDIO.address}
              />
              <ContactDetail
                icon={<MailOutlinedIcon fontSize="small" />}
                label="Email"
                value={
                  <Link href={`mailto:${STUDIO.email}`} underline="hover" color="inherit">
                    {STUDIO.email}
                  </Link>
                }
              />
              <ContactDetail
                icon={<PhoneOutlinedIcon fontSize="small" />}
                label="Phone"
                value={
                  <Link href={`tel:${STUDIO.phone}`} underline="hover" color="inherit">
                    {STUDIO.phone}
                  </Link>
                }
              />
              <ContactDetail
                icon={<ScheduleOutlinedIcon fontSize="small" />}
                label="Hours"
                value={STUDIO.hours}
              />
            </Stack>
          </SurfaceCard>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <SurfaceCard sx={{ height: '100%', p: { xs: 3, sm: 4 } }}>
            {sent && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Thank you — we’ll get back to you shortly.
              </Alert>
            )}
            <Stack component="form" method="post" spacing={2} autoComplete="on" onSubmit={(event) => void onSubmit(event)}>
              <TextField
                id="contact-name"
                name="name"
                label="Name"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                error={Boolean(fieldErrors.fullName)}
                helperText={fieldErrors.fullName}
                required
                fullWidth
                slotProps={{ htmlInput: { minLength: 2, autoCapitalize: 'words' } }}
              />
              <TextField
                id="contact-email"
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
                required
                fullWidth
                slotProps={{ htmlInput: emailInputAttrs }}
              />
              <TextField
                id="contact-message"
                name="message"
                label="How can we help?"
                autoComplete="off"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                error={Boolean(fieldErrors.message)}
                helperText={fieldErrors.message}
                required
                fullWidth
                multiline
                minRows={5}
                slotProps={{ htmlInput: { minLength: 10, maxLength: 2000 } }}
              />
              <Button type="submit" variant="contained" size="large" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send message'}
              </Button>
            </Stack>
          </SurfaceCard>
        </Grid>
      </Grid>
    </PageShell>
  );
}

function ContactDetail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          mt: 0.15,
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: bloomTokens.color.roseLight,
          color: bloomTokens.color.roseDark,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Stack spacing={0.25}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.16em', lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.primary">
          {value}
        </Typography>
      </Stack>
    </Stack>
  );
}
