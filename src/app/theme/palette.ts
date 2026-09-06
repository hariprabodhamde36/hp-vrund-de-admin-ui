import type { PaletteOptions } from '@mui/material'
import { tokens } from './tokens'

export const palette: PaletteOptions = {
  mode: 'light',
  primary: { main: tokens.color.primary, dark: tokens.color.primaryHover },
  secondary: { main: tokens.color.secondary },
  success: { main: tokens.color.success },
  warning: { main: tokens.color.warning },
  error: { main: tokens.color.error },
  info: { main: tokens.color.info },
  background: { default: tokens.color.background, paper: tokens.color.surface },
  text: { primary: tokens.color.textPrimary, secondary: tokens.color.textSecondary },
  divider: tokens.color.divider,
}
