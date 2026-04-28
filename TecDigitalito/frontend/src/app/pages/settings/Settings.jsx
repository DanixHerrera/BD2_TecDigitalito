import { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import '@/styles/Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('password');

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Configuración</h1>
        <p>Configuracion de tu cuenta.</p>
      </div>

      <div className="settings-layout">
        <aside className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Lock size={18} />
            Cambiar contraseña
          </button>
        </aside>

        <section className="settings-content">
          {activeTab === 'password' && <ChangePassword />}
        </section>
      </div>
    </div>
  );
}

function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordIsValid = form.newPassword.length >= 6;
  const canSubmit = form.currentPassword && form.newPassword && passwordIsValid && !loading;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage('');
    setMessageType('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) {
      setMessage('Completa los campos y usa una contraseña válida.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.ok) {
        setMessage(data.message || 'No se pudo cambiar la contraseña.');
        setMessageType('error');
        return;
      }

      setMessage('Contraseña actualizada correctamente.');
      setMessageType('success');
      setForm({ currentPassword: '', newPassword: '' });
    } catch {
      setMessage('Error de conexión con el servidor.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-card">
      <div className="settings-card-header">
        <div className="settings-icon-box">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2>Cambiar contraseña</h2>
          <p>Actualiza tu contraseña para mejorar la seguridad de tu cuenta.</p>
        </div>
      </div>

      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="settings-form-group">
          <label>Contraseña actual</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            placeholder="Ingresa tu contraseña actual"
          />
        </div>

        <div className="settings-form-group">
          <label>Nueva contraseña</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Ingresa tu nueva contraseña"
          />
          <span className={passwordIsValid || !form.newPassword ? 'password-hint' : 'password-hint error'}>
            Mínimo 6 caracteres.
          </span>
        </div>

        {message && (
          <div className={`settings-message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="settings-actions">
          <button type="submit" className="settings-save-btn" disabled={!canSubmit}>
            {loading ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
}