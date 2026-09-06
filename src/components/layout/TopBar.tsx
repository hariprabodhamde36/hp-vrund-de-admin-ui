import { AppBar, Box, Toolbar, Typography } from '@mui/material'
import { env } from '@/lib/env'
import UserMenu from './UserMenu'

export default function TopBar() {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <Typography variant="h6" noWrap>
          {env.appName}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <UserMenu />
      </Toolbar>
    </AppBar>
  )
}
