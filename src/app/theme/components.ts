import type { Components, Theme } from '@mui/material'
import { tokens } from './tokens'

export const componentOverrides: Components<Omit<Theme, 'components'>> = {
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { textTransform: 'none', fontWeight: tokens.font.weightBold },
    },
  },
  MuiTextField: {
    defaultProps: { size: 'small', fullWidth: true },
  },
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: { backgroundImage: 'none' },
    },
  },
  MuiAppBar: {
    defaultProps: { elevation: 0, color: 'inherit' },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({ border: `1px solid ${theme.palette.divider}` }),
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: { borderRadius: tokens.radius - 2 },
    },
  },
}
