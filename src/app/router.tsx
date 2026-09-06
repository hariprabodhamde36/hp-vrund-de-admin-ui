import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import FullPageLoader from '@/components/common/FullPageLoader'
import NotFoundPage from '@/components/common/NotFoundPage'
import AppShell from '@/components/layout/AppShell'
import ProtectedRoute from '@/routes/ProtectedRoute'
import PublicOnlyRoute from '@/routes/PublicOnlyRoute'
import { ROUTES } from '@/routes/paths'

// Routed pages are split out of the initial bundle. The shell, guards and
// loader stay eager — they render before any page does.
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const VideoUploadPage = lazy(() => import('@/features/media/video/pages/VideoUploadPage'))
const AudioUploadPage = lazy(() => import('@/features/media/audio/pages/AudioUploadPage'))
const ImageUploadPage = lazy(() => import('@/features/media/images/pages/ImageUploadPage'))
const PdfUploadPage = lazy(() => import('@/features/media/pdf/pages/PdfUploadPage'))

export function AppRoutes() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path={ROUTES.home} element={<Navigate to={ROUTES.videoUpload} replace />} />
            <Route path={ROUTES.videoUpload} element={<VideoUploadPage />} />
            <Route path={ROUTES.audioUpload} element={<AudioUploadPage />} />
            <Route path={ROUTES.imageUpload} element={<ImageUploadPage />} />
            <Route path={ROUTES.pdfUpload} element={<PdfUploadPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
