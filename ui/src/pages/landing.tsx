import { SignInButton, useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const { isSignedIn } = useAuth()
  const { t } = useTranslation()

  if (isSignedIn) return <Navigate to="/dashboard" replace />

  return (
    <div className="flex min-h-[calc(100vh-53px)] flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-4 text-5xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
        Portfolio Portal
      </h1>
      <p className="mb-10 max-w-md text-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {t('hero.sub')}
      </p>
      <SignInButton>
        <Button size="lg">{t('hero.cta')}</Button>
      </SignInButton>
    </div>
  )
}
