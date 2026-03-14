import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import ProfileModal from './profile-modal'

type Profile = {
  id: string
  name: string
  qualifications: string | null
  career: string | null
  shareSlug: string | null
  createdAt: string
  updatedAt: string
}

type ModalState =
  | { type: 'closed' }
  | { type: 'create' }
  | { type: 'edit'; profile: Profile }

export default function Portfolio() {
  const { isSignedIn, getToken } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [myProfile, setMyProfile] = useState<Profile | null>(null)
  const [shareSlug, setShareSlug] = useState('')
  const [modal, setModal] = useState<ModalState>({ type: 'closed' })

  const authHeaders = async () => {
    const token = await getToken()
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }

  const fetchProfiles = async () => {
    const res = await fetch('/api/profiles')
    const data = await res.json()
    if (res.ok) setProfiles(data.profiles)
  }

  const fetchMyProfile = async () => {
    const headers = await authHeaders()
    const res = await fetch('/api/profiles/me', { headers })
    const data = await res.json()
    if (res.ok) {
      setMyProfile(data)
      setShareSlug(data.shareSlug ?? '')
    }
  }

  const handleSlugBlur = async () => {
    if (!myProfile) return
    const headers = await authHeaders()
    await fetch('/api/profiles/me', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ shareSlug: shareSlug || null }),
    })
  }

  const handleCopyShareLink = async () => {
    const headers = await authHeaders()
    const res = await fetch('/api/share-links', { method: 'POST', headers })
    const data = await res.json()
    const slug = shareSlug || 'profile'
    const url = `${window.location.origin}/${slug}/?share=${data.token}`
    await navigator.clipboard.writeText(url)
    alert('共有リンクをコピーしました')
  }

  const handleDelete = async () => {
    const headers = await authHeaders()
    await fetch('/api/profiles/me', { method: 'DELETE', headers })
    fetchProfiles()
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  useEffect(() => {
    if (isSignedIn) fetchMyProfile()
  }, [isSignedIn])

  return (
    <>
      {isSignedIn && <button onClick={() => setModal({ type: 'create' })}>作成</button>}

      {isSignedIn && (
        <div>
          <input
            value={shareSlug}
            onChange={(e) => setShareSlug(e.target.value)}
            onBlur={handleSlugBlur}
            placeholder="your-name"
          />
          <button onClick={handleCopyShareLink}>共有リンクをコピー</button>
        </div>
      )}

      <ul>
        {profiles.map((profile) => (
          <li key={profile.id}>
            <span>{profile.name}</span>
            {isSignedIn && (
              <>
                <button onClick={() => setModal({ type: 'edit', profile })}>編集</button>
                <button onClick={handleDelete}>削除</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {modal.type !== 'closed' && (
        <ProfileModal
          profile={modal.type === 'edit' ? modal.profile : undefined}
          onClose={() => setModal({ type: 'closed' })}
          onSave={fetchProfiles}
          getToken={getToken}
        />
      )}
    </>
  )
}
