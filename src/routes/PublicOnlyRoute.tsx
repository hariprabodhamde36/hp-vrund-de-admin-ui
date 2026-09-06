import { Navigate, Outlet } from 'react-router-dom'
import FullPageLoader from '@/components/common/FullPageLoader'
import { useAuth } from '@/features/auth/useAuth'
import { ROUTES } from './paths'

export default function PublicOnlyRoute() {
  const { status } = useAuth()

  if (status === 'loading') {
    return <FullPageLoader />
  }

  if (status === 'authenticated') {
    return <Navigate to={ROUTES.videoUpload} replace />
  }

  return <Outlet />
}
