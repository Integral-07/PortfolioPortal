import { useSearchParams } from 'react-router-dom'
import SharedProfile from '@/components/shared-profile'

export default function SharedView() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('share') ?? ''
  return <SharedProfile token={token} />
}
