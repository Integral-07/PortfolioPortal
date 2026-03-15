import { SignInButton, SignOutButton, useAuth } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export default function Header() {
  const { isSignedIn } = useAuth()
  const { t, i18n } = useTranslation()

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-sm"
      style={{ background: 'rgba(13,17,23,0.8)', borderColor: 'var(--border)' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <span className="text-base font-semibold tracking-tight">Portfolio Portal</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'ja' ? 'en' : 'ja')}
            className="rounded border px-2 py-1 text-xs transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {i18n.language === 'ja' ? 'EN' : 'JA'}
          </button>
          <Button variant="ghost" size="sm" asChild>
            <a href="mailto:contact@example.com">{t('nav.contact')}</a>
          </Button>
          {isSignedIn ? (
            <SignOutButton>
              <Button variant="outline" size="sm">{t('nav.signOut')}</Button>
            </SignOutButton>
          ) : (
            <SignInButton>
              <Button size="sm">{t('nav.signIn')}</Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  )
}
