import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { Pencil, Users, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Group = { id: string; name: string }

export default function DashboardPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const { t } = useTranslation()
  const [profileName, setProfileName] = useState<string | null>(null)
  const [shareSlug, setShareSlug] = useState<string | null>(null)
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    const fetch_ = async () => {
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }
      const [profileRes, groupsRes] = await Promise.all([
        fetch('/api/profiles/me', { headers }),
        fetch('/api/groups', { headers }),
      ])
      if (profileRes.ok) {
        const data = await profileRes.json()
        setProfileName(data.name)
        setShareSlug(data.shareSlug)
      }
      if (groupsRes.ok) {
        const data = await groupsRes.json()
        setGroups(data.groups)
      }
    }
    fetch_()
  }, [])

  const handleCopyLink = async (groupId: string) => {
    const token = await getToken()
    const res = await fetch('/api/share-links', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId }),
    })
    const data = await res.json()
    const slug = shareSlug || 'profile'
    const url = `${window.location.origin}/${slug}/?share=${data.token}`
    await navigator.clipboard.writeText(url)
    alert('共有リンクをコピーしました')
  }

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

        <div className="border-t pt-4 flex gap-2" style={{ borderColor: 'var(--glass-border)' }}>
          <Button variant="outline" size="sm" asChild>
            <Link to="/me">
              <Pencil className="h-3.5 w-3.5" />
              ポートフォリオを編集
            </Link>
          </Button>
        </div>
      </div>

      {groups.length > 0 && (
        <div className="glass rounded-xl mt-6 px-6 py-5 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>グループ</p>
            <Button variant="outline" size="sm" asChild>
            <Link to="/groups">
              <Users className="h-3.5 w-3.5" />
              グループ管理
            </Link>
          </Button>
          </div>
          <div className="space-y-2">
            {groups.map((group) => (
              <div key={group.id} className="flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-sm" style={{ color: 'var(--text)' }}>{group.name}</span>
                <div className="flex items-center">
                  <Button size="icon" variant="ghost" title="共有リンクをコピー" onClick={() => handleCopyLink(group.id)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
