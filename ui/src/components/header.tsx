import { SignInButton, UserButton, useAuth } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/use-theme'

export default function Header() {
  const { isSignedIn } = useAuth()
  const { t, i18n } = useTranslation()
  const { theme, toggle } = useTheme()

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-sm"
      style={{ background: theme === 'dark' ? 'rgba(13,17,23,0.8)' : 'rgba(255,255,255,0.8)', borderColor: 'var(--border)' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" className="text-base font-semibold tracking-tight hover:opacity-75 transition-opacity">Portfolio Portal</Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggle}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
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
            <UserButton />
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
