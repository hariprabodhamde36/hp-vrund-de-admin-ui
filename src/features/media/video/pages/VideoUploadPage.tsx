import { Card, CardContent, Typography } from '@mui/material'
import PageHeader from '@/components/common/PageHeader'

export default function VideoUploadPage() {
  return (
    <>
      <PageHeader title="Video Upload" description="YouTube video IDs and uploaded video assets." />
      <Card>
        <CardContent>
          <Typography variant="h6">Hi from video upload page</Typography>
        </CardContent>
      </Card>
    </>
  )
}
