import { Card, CardContent, Typography } from '@mui/material'
import PageHeader from '@/components/common/PageHeader'

export default function AudioUploadPage() {
  return (
    <>
      <PageHeader
        title="Audio Upload"
        description="Audio files uploaded through the backend to S3."
      />
      <Card>
        <CardContent>
          <Typography variant="h6">Hi from audio upload page</Typography>
        </CardContent>
      </Card>
    </>
  )
}
