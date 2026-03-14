import { SignInButton, SignOutButton, useAuth } from '@clerk/clerk-react'
import Portfolio from './components/portfolio'
import SharedProfile from './components/shared-profile'

export default function App() {
  const { isSignedIn } = useAuth()
  const shareToken = new URLSearchParams(window.location.search).get('share')

  if (shareToken) {
    return <SharedProfile token={shareToken} />
  }

  return (
    <div>
      <div>
        <h1>Portfolio Portal</h1>
        {isSignedIn ? <SignOutButton /> : <SignInButton />}
      </div>
      <Portfolio />
    </div>
  )
}
