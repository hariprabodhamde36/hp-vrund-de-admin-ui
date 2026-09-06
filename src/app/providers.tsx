import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { NotificationProvider } from '@/components/common/NotificationProvider'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { queryClient } from './queryClient'
import { theme } from './theme'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <NotificationProvider>
              <AuthProvider>{children}</AuthProvider>
            </NotificationProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </BrowserRouter>
  )
}
