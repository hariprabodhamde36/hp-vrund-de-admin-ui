import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotify } from '@/components/common/useNotify'
import { useAuth } from '@/features/auth/useAuth'
import { toDisplayMessage } from '@/lib/api/errors'
import { ROUTES } from '@/routes/paths'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const { notify } = useNotify()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const initial = (user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleLogout = async () => {
    handleClose()
    try {
      await logout()
    } catch (error) {
      notify(toDisplayMessage(error), 'error')
    }
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <>
      <IconButton onClick={handleOpen} aria-label="Open account menu" size="small">
        <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}>
          {initial}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 220, border: 1, borderColor: 'divider' } } }}
      >
        <Stack sx={{ px: 2, py: 1.5 }}>
          {user?.name ? <Typography variant="subtitle2">{user.name}</Typography> : null}
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Stack>
        <Divider />
        <MenuItem onClick={() => void handleLogout()}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign out" />
        </MenuItem>
      </Menu>
    </>
  )
}
