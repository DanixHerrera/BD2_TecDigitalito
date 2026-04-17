import { createBrowserRouter } from 'react-router'
import AuthLayout from './layouts/AuthLayout'
import MainLayout from './layouts/MainLayout'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import NotFound from './pages/NotFound'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login',    element: <Login /> },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      { path: '/',         element: <Home /> },
      { path: '/home',     element: <Home /> },
      { path: '*',         element: <NotFound /> },
    ],
  },
])
