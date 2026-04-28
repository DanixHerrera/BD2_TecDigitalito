import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { validateEmail, validatePassword, validateForm } from '../../../lib/validations';
import '../../../styles/Login.css';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validationRules = {
  username: (value) => {
    if (!value?.trim()) return 'Este campo es requerido';
    return null;
  },
  password: validatePassword,
};

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm(formData, validationRules);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setErrors({ form: data.message });
        return;
      }

      login(data.user);
      navigate('/');
    } catch {
      setErrors({ form: 'Error de conexión con el servidor.' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-visual"></div>

        <div className="login-content">
          <h2 className="login-title">Iniciar Sesión</h2>

          {errors.form && (
            <div
              className="error-message form-error"
              style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: '#ffe5e5',
                color: '#d32f2f',
                borderRadius: '4px',
                textAlign: 'center',
                fontSize: '0.875rem',
              }}
            >
              {errors.form}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Correo electronico o usuario <span>*</span>
              </label>

              <div className="input-wrapper">
                <input
  id="username"
  type="text"
  className={`form-input ${errors.username ? 'error' : ''}`}
  placeholder="ejemplo@estudiantec.cr o usuario"
  value={formData.username}
  onChange={handleChange}
/>
                {errors.username && <p className="error-message">{errors.username}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Contraseña <span>*</span>
              </label>

              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>

                {errors.password && <p className="error-message">{errors.password}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="login-footer">
            ¿No tienes una cuenta? <a href="/register" className="footer-link">Registrarse</a>
          </div>
        </div>
      </div>
    </div>
  );
}