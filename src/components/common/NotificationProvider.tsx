import { Alert, Snackbar } from '@mui/material'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  NotificationContext,
  type NotificationContextValue,
  type NotifySeverity,
} from './notificationContext'

interface Notification {
  message: string
  severity: NotifySeverity
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null)
  const [open, setOpen] = useState(false)

  const notify = useCallback((message: string, severity: NotifySeverity = 'info') => {
    setNotification({ message, severity })
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => setOpen(false), [])

  const value = useMemo<NotificationContextValue>(() => ({ notify }), [notify])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={notification?.severity ?? 'info'}
          variant="filled"
          onClose={handleClose}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}
