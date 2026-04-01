import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Group } from '@/types/Group'

type LinkField = {
  id: string
  label: string
  body: string
  groupIds: string[]
}

type Props = {
  field?: LinkField
  groups: Group[]
  defaultGroupId?: string
  onClose: () => void
  onSave: () => void
  getToken: () => Promise<string | null>
}

export default function LinkModal({ field, groups, defaultGroupId, onClose, onSave, getToken }: Props) {
  const isEdit = !!field
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    field?.groupIds ?? (defaultGroupId ? [defaultGroupId] : []),
  )

  const toggleGroup = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const url = (form.elements.namedItem('url') as HTMLInputElement).value
    const label = (form.elements.namedItem('label') as HTMLInputElement).value
    const body = {
      type: 'link',
      label: label || url,
      body: url,
      groupIds: selectedGroupIds,
    }
    const token = await getToken()
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    const apiUrl = isEdit ? `/api/profile-fields/${field.id}` : '/api/profile-fields'
    const method = isEdit ? 'PUT' : 'POST'
    await fetch(apiUrl, { method, headers, body: JSON.stringify(body) })
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
            {isEdit ? 'リンクを編集' : 'リンクを追加'}
          </h2>
          <button onClick={onClose} className="rounded p-1 transition-colors hover:opacity-70">
            <X className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                URL <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <Input name="url" type="url" defaultValue={field?.body ?? ''} placeholder="https://..." required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                表示名 <span className="text-xs font-normal">（省略するとURLを使用）</span>
              </label>
              <Input name="label" defaultValue={field?.label !== field?.body ? (field?.label ?? '') : ''} placeholder="例：GitHub、個人ブログ" />
            </div>
            {groups.length > 0 && (
              <div>
                <label className="mb-2 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  表示するグループ
                </label>
                <div className="flex flex-wrap gap-2">
                  {groups.map((group) => {
                    const selected = selectedGroupIds.includes(group.id)
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className="rounded-full border px-3 py-1 text-xs transition-colors"
                        style={{
                          borderColor: selected ? 'var(--accent)' : 'var(--border)',
                          background: selected ? 'rgba(88,166,255,0.15)' : 'transparent',
                          color: selected ? 'var(--accent)' : 'var(--text-muted)',
                        }}
                      >
                        {group.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 border-t px-5 py-4" style={{ borderColor: 'var(--glass-border)' }}>
            <Button type="button" variant="ghost" onClick={onClose}>キャンセル</Button>
            <Button type="submit">{isEdit ? '保存' : '追加'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
