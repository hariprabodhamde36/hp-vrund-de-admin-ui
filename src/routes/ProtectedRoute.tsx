import { Navigate, Outlet, useLocation } from 'react-router-dom'
import FullPageLoader from '@/components/common/FullPageLoader'
import { useAuth } from '@/features/auth/useAuth'
import { ROUTES } from './paths'

export default function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <FullPageLoader />
  }

  if (status === 'unauthenticated') {
    const from = `${location.pathname}${location.search}`
    return <Navigate to={`${ROUTES.login}?from=${encodeURIComponent(from)}`} replace />
  }

  return <Outlet />
}
