import { useContext } from 'react'
import { NotificationContext, type NotificationContextValue } from './notificationContext'

export function useNotify(): NotificationContextValue {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotify must be used inside <NotificationProvider>.')
  }
  return context
}
