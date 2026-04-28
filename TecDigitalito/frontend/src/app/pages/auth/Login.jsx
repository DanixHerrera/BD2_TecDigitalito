import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { validatePassword, validateForm } from '../../../lib/validations';
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

    if (errors[id] || errors.form) {
      setErrors((prev) => ({ ...prev, [id]: null, form: null }));
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
        <div className="login-visual" aria-hidden="true"></div>

        <main className="login-content">
          <h1 className="login-title">Iniciar Sesión</h1>

          {errors.form && (
            <div
              role="alert"
              aria-live="assertive"
              className="error-message form-error"
              style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: '#ffe5e5',
                color: '#9b1c1c',
                borderRadius: '4px',
                textAlign: 'center',
                fontSize: '0.875rem',
              }}
            >
              {errors.form}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulario de inicio de sesión"
          >
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Correo electrónico o usuario <span aria-hidden="true">*</span>
              </label>

              <div className="input-wrapper">
                <input
                  id="username"
                  type="text"
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  placeholder="correo@ejemplo.com o usuario"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  aria-required="true"
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                />

                {errors.username && (
                  <p id="username-error" className="error-message" role="alert">
                    {errors.username}
                  </p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Contraseña <span aria-hidden="true">*</span>
              </label>

              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>

                {errors.password && (
                  <p id="password-error" className="error-message" role="alert">
                    {errors.password}
                  </p>
                )}
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
        </main>
      </div>
    </div>
  );
}