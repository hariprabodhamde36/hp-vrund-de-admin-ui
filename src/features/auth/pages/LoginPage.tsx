import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { env } from '@/lib/env'
import { ROUTES } from '@/routes/paths'
import LoginForm from '../components/LoginForm'
import type { LoginRequest } from '../types'
import { useAuth } from '../useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Only same-site paths are honoured, so ?from= cannot bounce to another origin.
  const requested = searchParams.get('from')
  const from = requested && requested.startsWith('/') ? requested : ROUTES.videoUpload

  const handleSubmit = async (credentials: LoginRequest) => {
    await login(credentials)
    navigate(from, { replace: true })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Card sx={{ width: 420, maxWidth: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack spacing={0.5}>
              <Typography variant="h5">{env.appName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to continue.
              </Typography>
            </Stack>
            <LoginForm onSubmit={handleSubmit} />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
