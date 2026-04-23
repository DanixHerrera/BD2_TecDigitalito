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
    username: validateEmail,
    password: validatePassword,
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    // Limpiar error del campo mientras el usuario escribe
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar todos los campos
    const newErrors = validateForm(formData, validationRules);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    /* 
       Como hacer el FETCH (JSON):
       fetch('URL_BASE_DE_DATOS_O_API', {
         method: 'POST', // O GET, PUT, DELETE
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ 
           // Aquí van los datos que el backend espera
           email: 'VALOR_DEL_CAMPO',
           password: 'VALOR_DEL_CAMPO' 
         })
       })
    */

    // Simulacion del login 
    login({
      username: formData.username,
      name: formData.username.split('@')[0],
      role: 'student'
    });

    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-visual"></div>

        <div className="login-content">
          <h2 className="login-title">Iniciar Sesión</h2>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Dirección de correo electrónico <span>*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="username"
                  type="email"
                  className={`login-input ${errors.username ? 'error' : ''}`}
                  placeholder="ejemplo@estudiantec.cr"
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
                  type={showPassword ? "text" : "password"}
                  className={`login-input ${errors.password ? 'error' : ''}`}
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

            <button type="submit" className="login-button">
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
