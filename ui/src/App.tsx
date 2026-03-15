import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from '@/components/root'
import LandingPage from '@/pages/landing'
import DashboardPage from '@/pages/dashboard'
import MePage from '@/pages/me'
import SharedView from '@/pages/shared-view'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'me',
        element: <MePage />,
      },
      {
        path: ':slug',
        element: <SharedView />,
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
