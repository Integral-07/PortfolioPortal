import { useEffect, useState } from 'react'
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
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [modal, setModal] = useState<ModalState>({ type: 'closed' })
  const [error, setError] = useState<string | null>(null)

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/profiles')
      console.log('status:', res.status)
      const data = await res.json()
      console.log('data:', data)
      if (!res.ok) throw new Error(data.error?.message ?? 'エラーが発生しました')
      setProfiles(data.profiles)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/profiles/${id}`, { method: 'DELETE' })
    fetchProfiles()
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  return (
    <>
      <button onClick={() => setModal({ type: 'create' })}>作成</button>
      {error && <p>エラー: {error}</p>}

      <ul>
        {profiles.map((profile) => (
          <li key={profile.id}>
            <span>{profile.name}</span>
            <button onClick={() => setModal({ type: 'edit', profile })}>編集</button>
            <button onClick={() => handleDelete(profile.id)}>削除</button>
          </li>
        ))}
      </ul>

      {modal.type !== 'closed' && (
        <ProfileModal
          profile={modal.type === 'edit' ? modal.profile : undefined}
          onClose={() => setModal({ type: 'closed' })}
          onSave={fetchProfiles}
        />
      )}
    </>
  )
}
