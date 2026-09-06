import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/lib/api/errors'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Never retry client errors — a 401 or 403 will not fix itself.
        if (isApiError(error) && error.status >= 400 && error.status < 500) {
          return false
        }
        return failureCount < 1
      },
    },
    mutations: { retry: false },
  },
})
