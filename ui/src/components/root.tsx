import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import Header from '@/components/header'
import { useTheme } from '@/lib/use-theme'
import { notifyClerkLoaded, suspendUntilClerkLoaded } from '@/lib/clerk-resource'

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
      <div className="pt-[30px]">
        <Outlet />
      </div>
    </>
  )
}

export default function Root() {
  useTheme()

  return (
    <div style={{ color: 'var(--text)' }}>
      <div className="fixed inset-0 -z-10 bg-dotgrid" style={{ background: 'var(--bg-gradient)' }} />
      <ClerkInitializer />
      <Suspense fallback={null}>
        <RootContent />
      </Suspense>
    </div>
  )
}
