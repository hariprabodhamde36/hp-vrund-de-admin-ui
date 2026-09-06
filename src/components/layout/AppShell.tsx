import { Box, Toolbar } from '@mui/material'
import { Outlet } from 'react-router-dom'
import SideNav, { DRAWER_WIDTH } from './SideNav'
import TopBar from './TopBar'

export default function AppShell() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopBar />
      <SideNav />
      <Box
        component="main"
        sx={{ flexGrow: 1, minWidth: 0, width: `calc(100% - ${DRAWER_WIDTH}px)` }}
      >
        <Toolbar />
        <Box sx={{ p: 3, maxWidth: 1440 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
