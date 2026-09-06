import { Box, Button, Stack, Typography } from '@mui/material'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled render error:', error, info.componentStack)
  }

  private handleReload = (): void => {
    window.location.assign('/')
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) {
      return this.props.children
    }

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          bgcolor: 'background.default',
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 520, textAlign: 'center' }}>
          <Typography variant="h5">Something went wrong</Typography>
          <Typography color="text.secondary">{error.message}</Typography>
          <Button variant="contained" onClick={this.handleReload}>
            Reload the app
          </Button>
        </Stack>
      </Box>
    )
  }
}
