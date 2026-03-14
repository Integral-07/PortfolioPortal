type Profile = {
  id: string
  name: string
  qualifications: string | null
  career: string | null
}

type Props = {
  profile?: Profile
  onClose: () => void
  onSave: () => void
}

export default function ProfileModal({ profile, onClose, onSave }: Props) {
  const isEdit = !!profile

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const body = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      qualifications: (form.elements.namedItem('qualifications') as HTMLInputElement).value || null,
      career: (form.elements.namedItem('career') as HTMLInputElement).value || null,
    }

    if (isEdit) {
      await fetch(`/api/profiles/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }

    onSave()
    onClose()
  }

  return (
    <div>
      <div>
        <h2>{isEdit ? '編集' : '作成'}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>名前</label>
            <input name="name" defaultValue={profile?.name ?? ''} required />
          </div>
          <div>
            <label>資格</label>
            <input name="qualifications" defaultValue={profile?.qualifications ?? ''} />
          </div>
          <div>
            <label>経歴</label>
            <input name="career" defaultValue={profile?.career ?? ''} />
          </div>
          <button type="button" onClick={onClose}>キャンセル</button>
          <button type="submit">{isEdit ? '更新' : '作成'}</button>
        </form>
      </div>
    </div>
  )
}
