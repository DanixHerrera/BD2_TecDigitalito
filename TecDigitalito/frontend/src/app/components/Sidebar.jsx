import { NavLink } from 'react-router'
import { Home, Book, Users } from 'lucide-react'
import { cn } from './ui/utils'
import '@/styles/Sidebar.css'

export default function Sidebar({ isOpen, onClose }) {
  const links = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Cursos', path: '/courses', icon: Book },
    { name: 'Social', path: '/social/friends', icon: Users },
    { name: 'Mensajes', path: '/social/user-messages', icon: Users },
    { name: 'Directorio', path: '/social/students', icon: Users },
  ]

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={cn(
        "sidebar",
        isOpen ? "sidebar-open" : "sidebar-closed"
      )}>
        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink 
              key={link.path} 
              to={link.path} 
              className={({ isActive }) => cn("sidebar-link", isActive && "active")}
            >
              <link.icon size={18} className="sidebar-link-icon" /> 
              <span className="sidebar-link-text">{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
