import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import Header from '@/components/header'
import { useTheme } from '@/lib/use-theme'
import { notifyClerkLoaded, suspendUntilClerkLoaded } from '@/lib/clerk-resource'

const darkGradient = `
  radial-gradient(ellipse 100% 70% at 50% -5%, rgba(88, 166, 255, 0.55) 0%, transparent 55%),
  radial-gradient(ellipse 70% 60% at 85% 85%, rgba(63, 185, 80, 0.35) 0%, transparent 50%),
  radial-gradient(ellipse 60% 50% at 5% 80%, rgba(139, 92, 246, 0.35) 0%, transparent 50%),
  radial-gradient(ellipse 40% 40% at 60% 50%, rgba(31, 111, 235, 0.2) 0%, transparent 60%),
  var(--bg)
`

const lightGradient = `
  radial-gradient(ellipse 100% 70% at 50% -5%, rgba(9, 105, 218, 0.25) 0%, transparent 55%),
  radial-gradient(ellipse 70% 60% at 85% 85%, rgba(26, 127, 55, 0.2) 0%, transparent 50%),
  radial-gradient(ellipse 60% 50% at 5% 80%, rgba(130, 80, 223, 0.2) 0%, transparent 50%),
  radial-gradient(ellipse 40% 40% at 60% 50%, rgba(9, 105, 218, 0.12) 0%, transparent 60%),
  var(--bg)
`

function ClerkInitializer() {
  const { isLoaded } = useAuth()
  useEffect(() => {
    if (isLoaded) notifyClerkLoaded()
  }, [isLoaded])
  return null
}

function RootContent() {
  suspendUntilClerkLoaded()
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

export default function Root() {
  const { theme } = useTheme()
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ color: 'var(--text)' }}>
      <div className="fixed inset-0 -z-10" style={{ background: theme === 'dark' ? darkGradient : lightGradient }} />
      <ClerkInitializer />
      <Suspense fallback={null}>
        <RootContent />
      </Suspense>
    </div>
  )
}
