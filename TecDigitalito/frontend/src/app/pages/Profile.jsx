import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Camera, Shield, Mail, AtSign, Calendar } from 'lucide-react';
import '@/styles/Profile.css';

export default function Profile() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.ok) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="profile-page">Cargando perfil...</div>;
  if (!user) return <div className="profile-page">No se pudo cargar la información.</div>;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1 className="profile-title">Mi Cuenta</h1>
      </header>

      <main className="profile-content">
        <div className="card profile-card">
          {/* Sección de Foto */}
          <div className="profile-avatar-section">
            <div className="profile-avatar-container">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-placeholder">
                  <User size={80} />
                </div>
              )}
              <button className="profile-upload-btn">
                <Camera size={16} />
                Subir una foto
              </button>
            </div>
          </div>

          {/* Sección de Información */}
          <div className="profile-info-grid">
            <div className="info-block">
              <label className="info-label">
                <Shield size={16} /> Autoridad
              </label>
              <p className="info-value">{user.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
            </div>

            <div className="info-block">
              <label className="info-label">
                <AtSign size={16} /> Nombre de usuario
              </label>
              <p className="info-value">{user.username}</p>
            </div>

            <div className="info-block" style={{ gridColumn: 'span 2' }}>
              <label className="info-label">
                <User size={16} /> Nombre Completo
              </label>
              <p className="info-value">{user.fullName}</p>
            </div>

            <div className="info-block">
              <label className="info-label">
                <Mail size={16} /> Correo electrónico
              </label>
              <p className="info-value highlight-email">{user.email}</p>
            </div>

            <div className="info-block">
              <label className="info-label">
                <Calendar size={16} /> Fecha de nacimiento
              </label>
              <p className="info-value">
                {user.birthDate ? new Date(user.birthDate).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                }) : 'No especificada'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
