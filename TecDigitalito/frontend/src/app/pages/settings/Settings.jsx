import { useEffect, useState } from 'react';
import { Lock, ShieldCheck, Activity } from 'lucide-react';
import '@/styles/Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('password');

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Configuración</h1>
        <p>Administra la seguridad y actividad de tu cuenta.</p>
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

          <button
            className={`settings-tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <Activity size={18} />
            Actividad de sesión
          </button>
        </aside>

        <section className="settings-content">
          {activeTab === 'password' && <ChangePassword />}
          {activeTab === 'activity' && <SessionActivity />}
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
          <p>Actualiza tu contraseña para mantener tu cuenta segura.</p>
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

        {message && <div className={`settings-message ${messageType}`}>{message}</div>}

        <div className="settings-actions">
          <button type="submit" className="settings-save-btn" disabled={!canSubmit}>
            {loading ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
}

function SessionActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const formatDevice = (userAgent = '') => {
  if (!userAgent) return 'Dispositivo desconocido';

  const browser = userAgent.includes('Edg')
    ? 'Microsoft Edge'
    : userAgent.includes('Chrome')
      ? 'Google Chrome'
      : userAgent.includes('Firefox')
        ? 'Mozilla Firefox'
        : userAgent.includes('Safari')
          ? 'Safari'
          : 'Navegador desconocido';

  const os = userAgent.includes('Windows')
    ? 'Windows'
    : userAgent.includes('Mac')
      ? 'macOS'
      : userAgent.includes('Linux')
        ? 'Linux'
        : userAgent.includes('Android')
          ? 'Android'
          : userAgent.includes('iPhone')
            ? 'iPhone'
            : 'Sistema desconocido';

  return `${browser} · ${os}`;
};

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await fetch('/api/auth/logs', {
          credentials: 'include',
        });

        const data = await res.json();

        if (!data.ok) {
          setError(data.message || 'No se pudo cargar la actividad.');
          return;
        }

        setLogs(data.logs || []);
      } catch {
        setError('Error de conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const getActionLabel = (action) => {
    if (action === 'login_success') return 'Inicio exitoso';
    if (action === 'login_failed') return 'Inicio fallido';
    if (action === 'logout') return 'Cierre de sesión';
    return action;
  };

  return (
    <div className="settings-card activity-card">
      <div className="settings-card-header">
        <div className="settings-icon-box">
          <Activity size={24} />
        </div>
        <div>
          <h2>Actividad de sesión</h2>
          <p>Consulta los últimos inicios y cierres de sesión registrados.</p>
        </div>
      </div>

      {loading && <div className="settings-empty">Cargando actividad...</div>}

      {!loading && error && <div className="settings-message error">{error}</div>}

      {!loading && !error && logs.length === 0 && (
        <div className="settings-empty">No hay actividad registrada.</div>
      )}

      {!loading && !error && logs.length > 0 && (
        <div className="activity-table-wrapper">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Acción</th>
                <th>Usuario</th>
                <th>IP</th>
                <th>Dispositivo</th>
                <th>Fecha y hora</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <span className={`activity-badge ${log.action}`}>
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td>{log.username || 'N/A'}</td>
                  <td>{log.ip || 'N/A'}</td>
                  <td className="activity-device">{formatDevice(log.userAgent)}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}