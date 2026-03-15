import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import GroupsSection from '@/components/groups-section'

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

      <div className="glass rounded-xl px-6 py-5 inline-flex flex-col gap-4 min-w-72">
        <div className="flex flex-col gap-2">
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

        <div className="border-t pt-4" style={{ borderColor: 'var(--glass-border)' }}>
          <Button variant="outline" size="sm" asChild>
            <Link to="/me">
              <Pencil className="h-3.5 w-3.5" />
              ポートフォリオを編集
            </Link>
          </Button>
        </div>
      </div>
      <div className="mt-8 max-w-lg">
        <GroupsSection />
      </div>
    </main>
  )
}
