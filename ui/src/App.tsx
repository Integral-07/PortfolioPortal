import { SignInButton, SignOutButton, useAuth } from '@clerk/clerk-react'
import Portfolio from './components/portfolio'

export default function App() {
  const { isSignedIn } = useAuth()

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
