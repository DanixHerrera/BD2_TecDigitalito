import { Outlet } from 'react-router'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  )
}
