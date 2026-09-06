export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: Record<string, string>

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

const DEFAULT_MESSAGES: Record<number, string> = {
  0: 'Cannot reach the server. Check your connection and try again.',
  400: 'The request was invalid.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to do that.',
  404: 'We could not find what you were looking for.',
  409: 'That conflicts with something that already exists.',
  413: 'That file is too large.',
  429: 'Too many attempts. Please wait a moment and try again.',
  500: 'Something went wrong on the server.',
}

/** Reads a human message out of an unknown error payload shape. */
export function messageFromPayload(status: number, payload: unknown): string {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message
    }
    if (typeof record.error === 'string' && record.error.trim()) {
      return record.error
    }
    if (record.error && typeof record.error === 'object') {
      const nested = record.error as Record<string, unknown>
      if (typeof nested.message === 'string' && nested.message.trim()) {
        return nested.message
      }
    }
  }
  if (typeof payload === 'string' && payload.trim() && payload.length < 200) {
    return payload
  }
  return DEFAULT_MESSAGES[status] ?? `Request failed with status ${status}.`
}

/** Reads `{ errors: { field: message | [message] } }` when the backend sends it. */
export function fieldErrorsFromPayload(payload: unknown): Record<string, string> | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined
  }
  const errors = (payload as Record<string, unknown>).errors
  if (!errors || typeof errors !== 'object') {
    return undefined
  }
  const result: Record<string, string> = {}
  for (const [field, value] of Object.entries(errors as Record<string, unknown>)) {
    if (typeof value === 'string') {
      result[field] = value
    } else if (Array.isArray(value) && typeof value[0] === 'string') {
      result[field] = value[0]
    }
  }
  return Object.keys(result).length > 0 ? result : undefined
}

export function toDisplayMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
