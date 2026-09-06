import { Box, Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

export default function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h5">Page not found</Typography>
        <Typography color="text.secondary">
          The page you were looking for does not exist.
        </Typography>
        <Button component={Link} to={ROUTES.videoUpload} variant="contained">
          Back to the app
        </Button>
      </Stack>
    </Box>
  )
}
