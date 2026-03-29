import { useRef, useState } from 'react'
import { SignInButton, UserButton, useAuth } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { Moon, Sun, Menu, X, LayoutDashboard, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/use-theme'
import { useClickOutside } from '@/lib/use-click-outside'
import { useClerk } from '@clerk/clerk-react'

export default function Header() {
  const { isSignedIn } = useAuth()
  const { openSignIn } = useClerk()
  const { t, i18n } = useTranslation()
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useClickOutside(menuRef, () => setMenuOpen(false))

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm"
      style={{ background: theme === 'dark' ? 'rgba(13,17,23,0.8)' : 'rgba(255,255,255,0.8)', borderColor: 'var(--border)' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          {isSignedIn && (
            <div className="relative" ref={menuRef}>
              <Button variant="ghost" size="icon" onClick={() => setMenuOpen((o) => !o)}>
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
              {menuOpen && (
                <div
                  className="absolute left-0 top-full mt-2 w-48 rounded-xl border shadow-lg overflow-hidden"
                  style={{ background: theme === 'dark' ? 'rgba(22,27,34,1)' : 'rgba(255,255,255,1)', borderColor: 'var(--border)' }}
                >
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:opacity-70"
                    style={{ color: 'var(--text)' }}
                  >
                    <LayoutDashboard className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                    ダッシュボード
                  </Link>
                  <div className="h-px" style={{ background: 'var(--border)' }} />
                  <Link
                    to="/groups"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:opacity-70"
                    style={{ color: 'var(--text)' }}
                  >
                    <Users className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                    グループ管理
                  </Link>
                </div>
              )}
            </div>
          )}
          <Link to="/" className="text-base font-semibold tracking-tight hover:opacity-75 transition-opacity">Portfolio Portal</Link>
        </div>
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
            <a href="mailto:tk.07@outook.jp">{t('nav.contact')}</a>
          </Button>
          {isSignedIn ? (
            <UserButton />
          ) : (
            <Button size="sm" onClick={() => openSignIn()}>{t('nav.signIn')}</Button>
          )}
        </div>
      </div>
    </header>
  )
}
