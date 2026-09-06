import { createTheme, type Theme } from '@mui/material/styles'
import { componentOverrides } from './components'
import { palette } from './palette'
import { tokens } from './tokens'

export const theme: Theme = createTheme({
  palette,
  shape: { borderRadius: tokens.radius },
  typography: {
    fontFamily: tokens.font.family,
    fontSize: tokens.font.baseSize,
    fontWeightRegular: tokens.font.weightRegular,
    fontWeightMedium: tokens.font.weightMedium,
    fontWeightBold: tokens.font.weightBold,
    h5: { fontWeight: tokens.font.weightBold },
    h6: { fontWeight: tokens.font.weightBold },
    subtitle2: { fontWeight: tokens.font.weightMedium },
    button: { fontWeight: tokens.font.weightMedium },
  },
  components: componentOverrides,
})
