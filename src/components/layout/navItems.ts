import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import { ROUTES } from '@/routes/paths'

export interface NavItem {
  label: string
  to: string
  icon: SvgIconComponent
}

export const navItems: NavItem[] = [
  { label: 'Video Upload', to: ROUTES.videoUpload, icon: VideocamOutlinedIcon },
  { label: 'Audio Upload', to: ROUTES.audioUpload, icon: AudiotrackOutlinedIcon },
  { label: 'Image Upload', to: ROUTES.imageUpload, icon: ImageOutlinedIcon },
  { label: 'PDF Upload', to: ROUTES.pdfUpload, icon: PictureAsPdfOutlinedIcon },
]
