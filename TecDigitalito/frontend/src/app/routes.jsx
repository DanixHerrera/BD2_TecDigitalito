import { createBrowserRouter } from 'react-router'
import AuthLayout from './layouts/AuthLayout'
import MainLayout from './layouts/MainLayout'

// Pages
import Home from './pages/Home'
import Courses from './pages/courses/Courses'
import Course from './pages/courses/Course'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import NotFound from './pages/NotFound'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login',    element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      { path: '/',                  element: <Home /> },
      { path: '/home',              element: <Home /> },
      { path: '/courses',           element: <Courses /> },
      { path: '/courses/:courseId',  element: <Course /> },
      { path: '*',                  element: <NotFound /> },
    ],
  },
])
