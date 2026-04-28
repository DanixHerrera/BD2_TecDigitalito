import { createBrowserRouter } from 'react-router'
import AuthLayout from './layouts/AuthLayout'
import MainLayout from './layouts/MainLayout'

// Pages
import Home from './pages/Home'
import Courses from './pages/courses/Courses'
import CourseCreate from './pages/courses/CourseCreate'
import Course from './pages/courses/Course'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import NotFound from './pages/NotFound'
import Friends from './pages/social/Friends'
import UserMessages from './pages/social/UserMessages'
import Students from './pages/social/Students'
import FriendCourses from './pages/social/FriendCourses';
import Settings from './pages/settings/Settings';

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
      { path: '/courses/create',    element: <CourseCreate /> },
      { path: '/courses/:courseId',  element: <Course /> },
      { path: '/social/friends',        element: <Friends /> },
      { path: '/social/user-messages',  element: <UserMessages /> },
      { path: '/social/students',       element: <Students /> },
      { path: '/social/friends/:friendId/courses', element: <FriendCourses /> },
      { path: '*',                  element: <NotFound /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
])
