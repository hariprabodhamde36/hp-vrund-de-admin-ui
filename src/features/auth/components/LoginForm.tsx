import { Alert, Box, Button, Stack, TextField } from '@mui/material'
import { useState, type FormEvent } from 'react'
import { isApiError, toDisplayMessage } from '@/lib/api/errors'
import type { LoginRequest } from '../types'

interface LoginFormProps {
  onSubmit: (credentials: LoginRequest) => Promise<void>
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setFormError(null)
    setFieldErrors({})
    try {
      await onSubmit({ email: email.trim(), password })
    } catch (error) {
      setFormError(toDisplayMessage(error))
      if (isApiError(error) && error.fieldErrors) {
        setFieldErrors(error.fieldErrors)
      }
      setSubmitting(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        {formError ? <Alert severity="error">{formError}</Alert> : null}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
          autoComplete="email"
          autoFocus
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={Boolean(fieldErrors.password)}
          helperText={fieldErrors.password}
          autoComplete="current-password"
          required
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </Stack>
    </Box>
  )
}
