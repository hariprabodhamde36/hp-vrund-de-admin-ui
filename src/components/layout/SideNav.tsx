import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material'
import { NavLink, useLocation } from 'react-router-dom'
import { navItems } from './navItems'

export const DRAWER_WIDTH = 248

export default function SideNav() {
  const { pathname } = useLocation()

  const isSelected = (to: string) =>
    to === '/' ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ p: 1.5 }}>
        <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
          {navItems.map(({ label, to, icon: Icon }) => (
            <ListItemButton key={to} component={NavLink} to={to} selected={isSelected(to)}>
              <ListItemIcon sx={{ minWidth: 38 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} slotProps={{ primary: { variant: 'body2' } }} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}
