import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth, useClerk } from '@clerk/clerk-react'
import OgpCard from './ogp-card'
import type { Profile } from '@/types/Profile'
import type { Field } from '@/types/Field'

type Props = {
  token: string
}

export default function SharedProfile({ token }: Props) {
  const { isSignedIn, getToken } = useAuth()
  const { openSignIn } = useClerk()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fields, setFields] = useState<Field[]>([])
  const [error, setError] = useState<string | null>(null)
  const [favorited, setFavorited] = useState(false)

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

      if (isSignedIn) {
        const authToken = await getToken()
        const favRes = await fetch(`/api/favorites/${data.profile.id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        if (favRes.ok) {
          const favData = await favRes.json()
          setFavorited(favData.favorited)
        }
      }
    }
    fetch_()
  }, [token, isSignedIn])

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
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight">{profile.name}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                if (!isSignedIn) {
                  openSignIn()
                  return
                }
                const authToken = await getToken()
                const res = await fetch(`/api/favorites/${profile.id}`, {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${authToken}` },
                })
                if (res.ok) {
                  const data = await res.json()
                  setFavorited(data.favorited)
                }
              }}
            >
              <Star className="h-5 w-5" style={{ fill: favorited ? 'var(--accent)' : 'none', color: favorited ? 'var(--accent)' : 'var(--text-muted)' }} />
            </Button>
          </div>
          <div className="mt-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--accent) 8%, var(--accent) 92%, transparent)' }} />
          {profile.bio && (
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{profile.bio}</p>
          )}
        </div>
        <div className="space-y-4">
          {fields.map((field) => (
            field.type === 'heading' ? (
              <div key={field.id} className="pt-4 pb-1">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{field.label}</h2>
                <div className="mt-1 h-px" style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
              </div>
            ) : field.type === 'link' ? (
              <OgpCard key={field.id} url={field.body} label={field.label} />
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
