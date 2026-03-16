import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

type Profile = {
  id: string
  name: string
}

type Field = {
  id: string
  type: string
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
    <div className="flex min-h-screen items-center justify-center">
      <p style={{ color: 'var(--text-muted)' }}>{error}</p>
    </div>
  )

  if (!profile) return (
    <div className="flex min-h-screen items-center justify-center">
      <p style={{ color: 'var(--text-muted)' }}>読み込み中...</p>
    </div>
  )

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">{profile.name}</h1>
          <div className="mt-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--accent) 8%, var(--accent) 92%, transparent)' }} />
        </div>
        <div className="space-y-4">
          {fields.map((field) => (
            field.type === 'heading' ? (
              <div key={field.id} className="pt-4 pb-1">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{field.label}</h2>
                <div className="mt-1 h-px" style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
              </div>
            ) : (
              <div key={field.id} className="glass rounded-xl px-6 py-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                  {field.label}
                </p>
                <div className="prose prose-sm max-w-none prose-invert [.light_&]:prose-neutral">
                  <ReactMarkdown>{field.body}</ReactMarkdown>
                </div>
              </div>
            )
          ))}
          {fields.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>表示できる項目がありません</p>
          )}
        </div>
      </div>
    </div>
  )
}
