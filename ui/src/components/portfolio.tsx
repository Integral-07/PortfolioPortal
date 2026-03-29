import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { Link, Pencil, Trash2, Copy, Plus, GripVertical, ExternalLink } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ProfileModal from './profile-modal'
import FieldModal from './field-modal'
import HeadingModal from './heading-modal'
import LinkModal from './link-modal'

type Profile = {
  id: string
  name: string
  bio?: string | null
  shareSlug: string | null
  createdAt: string
  updatedAt: string
}

type Field = {
  id: string
  type: string
  label: string
  body: string
  order: number
  groupIds: string[]
}

type ProfileModalState = { type: 'closed' } | { type: 'create' } | { type: 'edit'; profile: Profile }
type FieldModalState = { type: 'closed' } | { type: 'create' } | { type: 'edit'; field: Field }
type HeadingModalState = { type: 'closed' } | { type: 'create' } | { type: 'edit'; field: Field }
type LinkModalState = { type: 'closed' } | { type: 'create' } | { type: 'edit'; field: Field }

type Group = { id: string; name: string; isDefault: boolean }

function SortableFieldItem({
  field,
  groups,
  onEdit,
  onEditHeading,
  onEditLink,
  onDelete,
}: {
  field: Field
  groups: Group[]
  onEdit: (f: Field) => void
  onEditHeading: (f: Field) => void
  onEditLink: (f: Field) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none shrink-0">
        <GripVertical className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
      </button>
      <div className="flex-1 min-w-0">
      {field.type === 'heading' ? (
        <div
          className="flex items-center justify-between rounded-lg border px-4 py-3"
          style={{ borderColor: 'var(--glass-border)', background: 'rgba(88,166,255,0.06)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{field.label}</p>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => onEditHeading(field)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="danger" size="icon" onClick={() => onDelete(field.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="flex items-start justify-between rounded-lg border px-4 py-3"
          style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}
        >
          <div className="flex-1 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{field.label}</p>
                {field.groupIds.map((gid) => {
                  const g = groups.find((g) => g.id === gid)
                  return g ? (
                    <span key={gid} className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'rgba(88,166,255,0.15)', color: 'var(--accent)' }}>
                      {g.name}
                    </span>
                  ) : null
                })}
              </div>
              {field.type === 'link' ? (
                <a href={field.body} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm" style={{ color: 'var(--accent)' }}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  {field.body}
                </a>
              ) : (
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{field.body}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1 ml-4 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => field.type === 'link' ? onEditLink(field) : onEdit(field)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="danger" size="icon" onClick={() => onDelete(field.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default function Portfolio() {
  const { getToken } = useAuth()
  const { t } = useTranslation()
  const [myProfile, setMyProfile] = useState<Profile | null>(null)
  const [fields, setFields] = useState<Field[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [shareSlug, setShareSlug] = useState('')
  const [profileModal, setProfileModal] = useState<ProfileModalState>({ type: 'closed' })
  const [fieldModal, setFieldModal] = useState<FieldModalState>({ type: 'closed' })
  const [headingModal, setHeadingModal] = useState<HeadingModalState>({ type: 'closed' })
  const [linkModal, setLinkModal] = useState<LinkModalState>({ type: 'closed' })
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

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

  const fetchGroups = async () => {
    const headers = await authHeaders()
    const res = await fetch('/api/groups', { headers })
    const data = await res.json()
    if (res.ok) setGroups(data.groups)
  }

  const fetchFields = async () => {
    const headers = await authHeaders()
    const res = await fetch('/api/profile-fields', { headers })
    const data = await res.json()
    if (res.ok) setFields([...data.fields].sort((a: Field, b: Field) => a.order - b.order))
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    const reordered = arrayMove(fields, oldIndex, newIndex)
    setFields(reordered)
    const headers = await authHeaders()
    await fetch('/api/profile-fields/reorder', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ids: reordered.map((f) => f.id) }),
    })
  }

  const handleDeleteField = async (fieldId: string) => {
    const headers = await authHeaders()
    await fetch(`/api/profile-fields/${fieldId}`, { method: 'DELETE', headers })
    fetchFields()
  }

  useEffect(() => {
    fetchMyProfile()
    fetchGroups()
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
          <div className="px-6 pt-4 pb-0">
            <div className="flex items-start justify-between">
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
            {myProfile.bio && (
              <div className="mt-3 rounded-lg border px-4 py-3" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>紹介文</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{myProfile.bio}</p>
              </div>
            )}
            <div className="mt-4 border-b" style={{ borderColor: 'var(--glass-border)' }} />
          </div>

          {/* フィールド一覧 */}
          <div className="px-6 py-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                項目
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setHeadingModal({ type: 'create' })}>
                  <Plus className="h-3.5 w-3.5" />
                  見出しを追加
                </Button>
                <Button size="sm" variant="outline" onClick={() => setFieldModal({ type: 'create' })}>
                  <Plus className="h-3.5 w-3.5" />
                  項目を追加
                </Button>
                <Button size="sm" variant="outline" onClick={() => setLinkModal({ type: 'create' })}>
                  <Plus className="h-3.5 w-3.5" />
                  リンクを追加
                </Button>
              </div>
            </div>

            {fields.length === 0 && (
              <p className="py-4 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                項目がありません
              </p>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                {fields.map((field) => (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    groups={groups}
                    onEdit={(f) => setFieldModal({ type: 'edit', field: f })}
                    onEditHeading={(f) => setHeadingModal({ type: 'edit', field: f })}
                    onEditLink={(f) => setLinkModal({ type: 'edit', field: f })}
                    onDelete={handleDeleteField}
                  />
                ))}
              </SortableContext>
            </DndContext>
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

      {linkModal.type !== 'closed' && (
        <LinkModal
          field={linkModal.type === 'edit' ? linkModal.field : undefined}
          groups={groups}
          defaultGroupId={groups.find((g) => g.isDefault)?.id}
          onClose={() => setLinkModal({ type: 'closed' })}
          onSave={fetchFields}
          getToken={getToken}
        />
      )}

      {headingModal.type !== 'closed' && (
        <HeadingModal
          heading={headingModal.type === 'edit' ? { id: headingModal.field.id, label: headingModal.field.label, groupIds: headingModal.field.groupIds } : undefined}
          onClose={() => setHeadingModal({ type: 'closed' })}
          onSave={fetchFields}
          getToken={getToken}
        />
      )}
    </div>
  )
}
