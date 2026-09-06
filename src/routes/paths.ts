export const ROUTES = {
  login: '/login',
  /** Redirects to the first media page; nothing renders here. */
  home: '/',
  videoUpload: '/media/video',
  audioUpload: '/media/audio',
  imageUpload: '/media/images',
  pdfUpload: '/media/pdf',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
