import { useEffect, useState } from 'react'

type Profile = {
  id: string
  name: string
  qualifications: string | null
  career: string | null
}

type Props = {
  token: string
}

export default function SharedProfile({ token }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch_ = async () => {
      const res = await fetch(`/api/share/${token}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error?.message ?? 'プロフィールが見つかりません')
        return
      }
      setProfile(data)
    }
    fetch_()
  }, [token])

  if (error) return <p>{error}</p>
  if (!profile) return <p>読み込み中...</p>

  return (
    <div>
      <h2>{profile.name}</h2>
      {profile.qualifications && (
        <div>
          <h3>資格</h3>
          <p>{profile.qualifications}</p>
        </div>
      )}
      {profile.career && (
        <div>
          <h3>経歴</h3>
          <p>{profile.career}</p>
        </div>
      )}
    </div>
  )
}
