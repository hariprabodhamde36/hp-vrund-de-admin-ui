import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Stack
      spacing={1.5}
      sx={{ alignItems: 'center', py: 8, px: 3, textAlign: 'center', color: 'text.secondary' }}
    >
      {icon ? <Box sx={{ fontSize: 40, lineHeight: 1 }}>{icon}</Box> : null}
      <Typography variant="subtitle1" color="text.primary">
        {title}
      </Typography>
      {description ? <Typography variant="body2">{description}</Typography> : null}
      {action ? <Box sx={{ pt: 1 }}>{action}</Box> : null}
    </Stack>
  )
}
