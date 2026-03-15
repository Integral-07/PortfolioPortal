import { useState } from 'react'
import { Plus, Copy, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Group = {
  id: string
  name: string
}

const DUMMY_GROUPS: Group[] = [
  { id: '1', name: '転職活動' },
  { id: '2', name: '友人' },
]

export default function GroupsSection() {
  const [groups, setGroups] = useState<Group[]>(DUMMY_GROUPS)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleCreate = () => {
    if (!newName.trim()) return
    setGroups((prev) => [...prev, { id: Date.now().toString(), name: newName.trim() }])
    setNewName('')
    setCreating(false)
  }

  const handleEdit = (id: string) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, name: editName.trim() } : g)))
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold" style={{ color: 'var(--text)' }}>グループ</h2>
        <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
          <Plus className="h-3.5 w-3.5" />
          追加
        </Button>
      </div>

      <div className="space-y-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className="flex items-center justify-between rounded-lg border px-4 py-3"
            style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}
          >
            {editingId === group.id ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(group.id); if (e.key === 'Escape') setEditingId(null) }}
                  className="flex-1 rounded border bg-transparent px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                />
                <Button size="sm" onClick={() => handleEdit(group.id)}>保存</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>キャンセル</Button>
              </div>
            ) : (
              <>
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{group.name}</span>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" title="共有リンクをコピー">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditingId(group.id); setEditName(group.name) }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="danger" onClick={() => handleDelete(group.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* 新規作成入力欄 */}
        {creating && (
          <div
            className="flex items-center gap-2 rounded-lg border px-4 py-3"
            style={{ borderColor: 'var(--accent-subtle)', background: 'rgba(31,111,235,0.05)' }}
          >
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
              placeholder="グループ名"
              className="flex-1 bg-transparent text-sm focus:outline-none"
              style={{ color: 'var(--text)' }}
            />
            <Button size="sm" onClick={handleCreate}>作成</Button>
            <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>キャンセル</Button>
          </div>
        )}

        {groups.length === 0 && !creating && (
          <p className="py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            グループがありません
          </p>
        )}
      </div>
    </div>
  )
}
