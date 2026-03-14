import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import ProfileModal from './profile-modal'

type Profile = {
  id: string
  name: string
  qualifications: string | null
  career: string | null
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

  const handleDelete = async () => {
    const headers = await authHeaders()
    await fetch('/api/profiles/me', { method: 'DELETE', headers })
    fetchProfiles()
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  return (
    <>
      {isSignedIn && <button onClick={() => setModal({ type: 'create' })}>作成</button>}

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
