import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { Link, Pencil, Trash2, Copy, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ProfileModal from './profile-modal'
import FieldModal from './field-modal'

type Profile = {
  id: string
  name: string
  shareSlug: string | null
  createdAt: string
  updatedAt: string
}

type Field = {
  id: string
  label: string
  body: string
  order: number
  groupIds: string[]
}

type ProfileModalState = { type: 'closed' } | { type: 'create' } | { type: 'edit'; profile: Profile }
type FieldModalState = { type: 'closed' } | { type: 'create' } | { type: 'edit'; field: Field }

export default function Portfolio() {
  const { getToken } = useAuth()
  const { t } = useTranslation()
  const [myProfile, setMyProfile] = useState<Profile | null>(null)
  const [fields, setFields] = useState<Field[]>([])
  const [shareSlug, setShareSlug] = useState('')
  const [profileModal, setProfileModal] = useState<ProfileModalState>({ type: 'closed' })
  const [fieldModal, setFieldModal] = useState<FieldModalState>({ type: 'closed' })

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

  const fetchFields = async () => {
    const headers = await authHeaders()
    const res = await fetch('/api/profile-fields', { headers })
    const data = await res.json()
    if (res.ok) setFields(data.fields)
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
    const res = await fetch('/api/share-links', { method: 'POST', headers, body: JSON.stringify({}) })
    const data = await res.json()
    const slug = shareSlug || 'profile'
    const url = `${window.location.origin}/${slug}/?share=${data.token}`
    await navigator.clipboard.writeText(url)
    alert(t('portfolio.copied'))
  }

  const handleDeleteProfile = async () => {
    if (!confirm(t('portfolio.deleteConfirm'))) return
    const headers = await authHeaders()
    await fetch('/api/profiles/me', { method: 'DELETE', headers })
    setMyProfile(null)
    setFields([])
  }

  const handleDeleteField = async (fieldId: string) => {
    const headers = await authHeaders()
    await fetch(`/api/profile-fields/${fieldId}`, { method: 'DELETE', headers })
    fetchFields()
  }

  useEffect(() => {
    fetchMyProfile()
  }, [])

  useEffect(() => {
    if (myProfile) fetchFields()
  }, [myProfile])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          {t('portfolio.title')}
        </h2>
        {!myProfile && (
          <Button onClick={() => setProfileModal({ type: 'create' })}>
            {t('portfolio.create')}
          </Button>
        )}
      </div>

      {!myProfile && (
        <div
          className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>{t('portfolio.empty')}</p>
          <Button onClick={() => setProfileModal({ type: 'create' })}>{t('portfolio.create')}</Button>
        </div>
      )}

      {myProfile && (
        <div className="glass rounded-xl">
          {/* プロフィールヘッダー */}
          <div className="flex items-start justify-between border-b px-6 py-4" style={{ borderColor: 'var(--glass-border)' }}>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{myProfile.name}</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setProfileModal({ type: 'edit', profile: myProfile })}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="danger" size="icon" onClick={handleDeleteProfile}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* フィールド一覧 */}
          <div className="px-6 py-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                項目
              </p>
              <Button size="sm" variant="outline" onClick={() => setFieldModal({ type: 'create' })}>
                <Plus className="h-3.5 w-3.5" />
                項目を追加
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="py-4 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                項目がありません
              </p>
            )}

            {fields.map((field) => (
              <div
                key={field.id}
                className="flex items-start justify-between rounded-lg border px-4 py-3"
                style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{field.label}</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{field.body}</p>
                </div>
                <div className="flex gap-1 ml-4 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => setFieldModal({ type: 'edit', field })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="danger" size="icon" onClick={() => handleDeleteField(field.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* 共有リンク */}
          <div className="border-t px-6 py-4" style={{ borderColor: 'var(--glass-border)' }}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              {t('portfolio.shareLinkLabel')}
            </p>
            <div className="flex gap-2">
              <div className="flex flex-1 items-center rounded-md border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                <span className="border-r px-3 py-2 text-xs shrink-0" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--bg)' }}>
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

      {profileModal.type !== 'closed' && (
        <ProfileModal
          profile={profileModal.type === 'edit' ? profileModal.profile : undefined}
          onClose={() => setProfileModal({ type: 'closed' })}
          onSave={fetchMyProfile}
          getToken={getToken}
        />
      )}

      {fieldModal.type !== 'closed' && (
        <FieldModal
          field={fieldModal.type === 'edit' ? fieldModal.field : undefined}
          onClose={() => setFieldModal({ type: 'closed' })}
          onSave={fetchFields}
          getToken={getToken}
        />
      )}
    </div>
  )
}
