import { NavLink } from 'react-router'
import { Home, Book, Users } from 'lucide-react'
import { cn } from './ui/utils'

export default function Sidebar({ isOpen, onClose }) {
  const links = [
    { name: 'Inicio', path: '/this-route-does-not-exist', icon: Home },
    { name: 'Cursos', path: '/my-enrollments', icon: Book },
    { name: 'Social', path: '/social/friends', icon: Users },
  ]

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        "fixed top-16 bottom-0 left-0 w-64 bg-white border-r z-40 transition-transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <nav className="p-4 flex flex-col gap-2">
          {links.map(link => (
            <NavLink key={link.path} to={link.path} className="flex gap-3 p-2 rounded hover:bg-slate-100 items-center">
              <link.icon size={18} /> 
              <span className="text-sm font-medium">{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
