import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'

export default function DashboardPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const { t } = useTranslation()
  const [profileName, setProfileName] = useState<string | null>(null)

  useEffect(() => {
    const fetch_ = async () => {
      const token = await getToken()
      const res = await fetch('/api/profiles/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProfileName(data.name)
      }
    }
    fetch_()
  }, [])

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold" style={{ color: 'var(--text)' }}>
        Dashboard
      </h1>
      <div className="glass rounded-xl px-6 py-5 inline-flex flex-col gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>名前</p>
          <p className="font-semibold" style={{ color: profileName ? 'var(--text)' : 'var(--text-muted)' }}>
            {profileName ?? t('dashboard.anonymousName')}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>メール</p>
          <p className="text-sm" style={{ color: 'var(--text)' }}>{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>
    </main>
  )
}
