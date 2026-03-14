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
  getToken: () => Promise<string | null>
}

export default function ProfileModal({ profile, onClose, onSave, getToken }: Props) {
  const isEdit = !!profile

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const body = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      qualifications: (form.elements.namedItem('qualifications') as HTMLInputElement).value || null,
      career: (form.elements.namedItem('career') as HTMLInputElement).value || null,
    }

    const token = await getToken()
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

    const url = isEdit ? '/api/profiles/me' : '/api/profiles'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, { method, headers, body: JSON.stringify(body) })
    const data = await res.json()

    if (!res.ok) {
      alert(`エラー: ${data.error?.message ?? '保存に失敗しました'}`)
      return
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
