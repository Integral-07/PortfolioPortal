import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Profile } from '@/types/Profile'

type Props = {
  profile?: Profile
  onClose: () => void
  onSave: () => void
  getToken: () => Promise<string | null>
}

export default function ProfileModal({ profile, onClose, onSave, getToken }: Props) {
  const { t } = useTranslation()
  const isEdit = !!profile

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const body = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      bio: (form.elements.namedItem('bio') as HTMLTextAreaElement).value || null,
    }
    const token = await getToken()
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    const url = isEdit ? '/api/profiles/me' : '/api/profiles'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers, body: JSON.stringify(body) })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error?.message ?? t('modal.saveError'))
      return
    }
    onSave()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass w-full max-w-md rounded-xl shadow-2xl" style={{ background: 'var(--bg-subtle)', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--glass-border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
            {isEdit ? t('modal.editTitle') : t('modal.createTitle')}
          </h2>
          <button onClick={onClose} className="rounded p-1 transition-colors hover:opacity-70">
            <X className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {t('modal.name')} <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <Input name="name" defaultValue={profile?.name ?? ''} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                紹介文
              </label>
              <textarea
                name="bio"
                defaultValue={profile?.bio ?? ''}
                rows={3}
                placeholder="自己紹介を入力..."
                className="w-full rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t px-5 py-4" style={{ borderColor: 'var(--glass-border)' }}>
            <Button type="button" variant="ghost" onClick={onClose}>{t('modal.cancel')}</Button>
            <Button type="submit">{isEdit ? t('modal.save') : t('modal.create')}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
