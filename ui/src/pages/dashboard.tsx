import { useTranslation } from 'react-i18next'

export default function DashboardPage() {
  const { t } = useTranslation()
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
        Dashboard
      </h1>
    </main>
  )
}
