import { env } from '@/lib/env'
import { ApiError, fieldErrorsFromPayload, messageFromPayload } from './errors'

export interface RequestOptions {
  signal?: AbortSignal
  /**
   * Skips the global 401 handler. Used by auth calls that legitimately expect
   * a 401 (session bootstrap, failed login) and must not trigger a redirect.
   */
  skipUnauthorizedHandler?: boolean
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

let unauthorizedHandler: (() => void) | null = null

/** Registered once by AuthProvider so any 401 clears the session. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

async function parsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }
  const text = await response.text()
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const hasBody = body !== undefined
  let response: Response

  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      credentials: 'include',
      headers: hasBody
        ? { Accept: 'application/json', 'Content-Type': 'application/json' }
        : { Accept: 'application/json' },
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: options.signal,
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw cause
    }
    throw new ApiError(0, messageFromPayload(0, null))
  }

  const payload = await parsePayload(response)

  if (!response.ok) {
    if (response.status === 401 && !options.skipUnauthorizedHandler) {
      unauthorizedHandler?.()
    }
    throw new ApiError(
      response.status,
      messageFromPayload(response.status, payload),
      fieldErrorsFromPayload(payload),
    )
  }

  return payload as T
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  del: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
}
