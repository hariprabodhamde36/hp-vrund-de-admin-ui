import { useEffect } from 'react'
import { AppProviders } from '@/app/providers'
import { AppRoutes } from '@/app/router'
import { env } from '@/lib/env'

export default function App() {
  useEffect(() => {
    document.title = env.appName
  }, [])

  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  )
}
