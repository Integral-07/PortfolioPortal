import { useEffect, useState } from 'react'

type Profile = {
  id: string
  name: string
}

type Field = {
  id: string
  label: string
  body: string
  order: number
}

type Props = {
  token: string
}

export default function SharedProfile({ token }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fields, setFields] = useState<Field[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch_ = async () => {
      const res = await fetch(`/api/share/${token}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error?.message ?? 'プロフィールが見つかりません')
        return
      }
      setProfile(data.profile)
      setFields(data.fields ?? [])
    }
    fetch_()
  }, [token])

  if (error) return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
      <p style={{ color: 'var(--text-muted)' }}>{error}</p>
    </div>
  )

  if (!profile) return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
      <p style={{ color: 'var(--text-muted)' }}>読み込み中...</p>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-8 text-3xl font-bold">{profile.name}</h1>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="glass rounded-xl px-6 py-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                {field.label}
              </p>
              <p className="text-sm whitespace-pre-wrap">{field.body}</p>
            </div>
          ))}
          {fields.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>表示できる項目がありません</p>
          )}
        </div>
      </div>
    </div>
  )
}
