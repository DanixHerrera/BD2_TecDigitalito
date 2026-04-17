import { useState } from 'react'
import { Outlet } from 'react-router'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onMenuClick={() => setSidebarOpen(prev => !prev)} />
      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
