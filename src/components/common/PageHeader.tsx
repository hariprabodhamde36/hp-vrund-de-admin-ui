import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h5">{title}</Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Stack>
      {actions ? <Box>{actions}</Box> : null}
    </Stack>
  )
}
