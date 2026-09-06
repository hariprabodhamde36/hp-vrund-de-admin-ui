import { Card, CardContent, Typography } from '@mui/material'
import PageHeader from '@/components/common/PageHeader'

export default function PdfUploadPage() {
  return (
    <>
      <PageHeader
        title="PDF Upload"
        description="PDF documents uploaded through the backend to S3."
      />
      <Card>
        <CardContent>
          <Typography variant="h6">Hi from pdf upload page</Typography>
        </CardContent>
      </Card>
    </>
  )
}
