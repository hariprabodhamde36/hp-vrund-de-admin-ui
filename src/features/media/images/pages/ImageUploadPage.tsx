import { Card, CardContent, Typography } from '@mui/material'
import PageHeader from '@/components/common/PageHeader'

export default function ImageUploadPage() {
  return (
    <>
      <PageHeader
        title="Image Upload"
        description="Image files uploaded through the backend to S3."
      />
      <Card>
        <CardContent>
          <Typography variant="h6">Hi from image upload page</Typography>
        </CardContent>
      </Card>
    </>
  )
}
