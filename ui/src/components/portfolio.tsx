import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { Link, Pencil, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const { getToken } = useAuth()
  const { t } = useTranslation()
  const [myProfile, setMyProfile] = useState<Profile | null>(null)
  const [shareSlug, setShareSlug] = useState('')
  const [modal, setModal] = useState<ModalState>({ type: 'closed' })

  const authHeaders = async () => {
    const token = await getToken()
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }

  const fetchMyProfile = async () => {
    const headers = await authHeaders()
    const res = await fetch('/api/profiles/me', { headers })
    const data = await res.json()
    if (res.ok) {
      setMyProfile(data)
      setShareSlug(data.shareSlug ?? '')
    } else {
      setMyProfile(null)
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
    alert(t('portfolio.copied'))
  }

  const handleDelete = async () => {
    if (!confirm(t('portfolio.deleteConfirm'))) return
    const headers = await authHeaders()
    await fetch('/api/profiles/me', { method: 'DELETE', headers })
    setMyProfile(null)
  }

  useEffect(() => {
    fetchMyProfile()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          {t('portfolio.title')}
        </h2>
        {!myProfile && (
          <Button onClick={() => setModal({ type: 'create' })}>
            {t('portfolio.create')}
          </Button>
        )}
      </div>

      {/* Empty state */}
      {!myProfile && (
        <div
          className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('portfolio.empty')}
          </p>
          <Button onClick={() => setModal({ type: 'create' })}>
            {t('portfolio.create')}
          </Button>
        </div>
      )}

      {/* Profile card */}
      {myProfile && (
        <div className="glass rounded-xl">
          {/* Card header */}
          <div className="flex items-start justify-between border-b px-6 py-4" style={{ borderColor: 'var(--glass-border)' }}>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
              {myProfile.name}
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setModal({ type: 'edit', profile: myProfile })}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="danger" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Card body */}
          <div className="space-y-5 px-6 py-5">
            {myProfile.qualifications && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  {t('modal.qualifications')}
                </p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                  {myProfile.qualifications}
                </p>
              </div>
            )}
            {myProfile.career && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  {t('modal.career')}
                </p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                  {myProfile.career}
                </p>
              </div>
            )}
          </div>

          {/* Share section */}
          <div className="border-t px-6 py-4" style={{ borderColor: 'var(--glass-border)' }}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              {t('portfolio.shareLinkLabel')}
            </p>
            <div className="flex gap-2">
              <div className="flex flex-1 items-center rounded-md border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                <span className="border-r px-3 py-2 text-xs" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--bg)' }}>
                  {window.location.origin}/
                </span>
                <Input
                  className="rounded-none border-0 focus:ring-0"
                  value={shareSlug}
                  onChange={(e) => setShareSlug(e.target.value)}
                  onBlur={handleSlugBlur}
                  placeholder={t('portfolio.sharePlaceholder')}
                />
              </div>
              <Button variant="outline" onClick={handleCopyShareLink}>
                <Copy className="h-4 w-4" />
                {t('portfolio.copyLink')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {modal.type !== 'closed' && (
        <ProfileModal
          profile={modal.type === 'edit' ? modal.profile : undefined}
          onClose={() => setModal({ type: 'closed' })}
          onSave={fetchMyProfile}
          getToken={getToken}
        />
      )}
    </div>
  )
}
