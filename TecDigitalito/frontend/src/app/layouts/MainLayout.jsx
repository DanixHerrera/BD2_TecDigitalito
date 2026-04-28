import { useState } from 'react';
import { Outlet, Navigate } from 'react-router';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import '../../styles/MainLayout.css';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <div>Cargando sesión...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="main-layout">
      <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
      <div className="main-content-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}