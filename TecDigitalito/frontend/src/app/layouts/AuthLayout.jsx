import { Outlet } from 'react-router'
import '../../styles/AuthLayout.css'

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-content-wrapper">
        <Outlet />
      </div>
    </div>
  )
}
