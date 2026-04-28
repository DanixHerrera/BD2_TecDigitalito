import { Link } from 'react-router'
import { Menu, Bell, User } from 'lucide-react'
import Clock from './Clock'
import '@/styles/Navbar.css'

export default function Navbar({ onMenuClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-section">
        <button onClick={onMenuClick} className="navbar-btn-mobile">
          <Menu size={20} />
        </button>
        <Link to="/" className="navbar-brand">tecDigitalito</Link>
      </div>
      <div className="navbar-actions">
        <Clock />
        <Bell size={20} className="cursor-pointer hover:text-primary transition-colors" />
        <User size={20} className="cursor-pointer hover:text-primary transition-colors" />
      </div>
    </nav>
  )
}
