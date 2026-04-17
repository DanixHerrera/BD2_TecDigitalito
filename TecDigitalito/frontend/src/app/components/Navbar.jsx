import { Link } from 'react-router'
import { Menu, Bell, User } from 'lucide-react'

export default function Navbar({ onMenuClick }) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2">
          <Menu size={20} />
        </button>
        <Link to="/this-route-does-not-exist" className="font-bold text-xl text-primary">tecDigitalito</Link>
      </div>
      <div className="flex items-center gap-4 text-muted-foreground">
        <Bell size={20} />
        <User size={20} />
      </div>
    </nav>
  )
}
