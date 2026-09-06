import { createContext } from 'react'

export type NotifySeverity = 'success' | 'info' | 'warning' | 'error'

export interface NotificationContextValue {
  notify: (message: string, severity?: NotifySeverity) => void
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)
