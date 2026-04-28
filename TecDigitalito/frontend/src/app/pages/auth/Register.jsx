import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Upload, User } from 'lucide-react';
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateFullName,
  validateBirthDate,
  validateAvatar,
  validateForm,
} from '../../../lib/validations';
import { getDominantColor } from '../../../lib/colors';
import '../../../styles/Register.css';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [visualColor, setVisualColor] = useState('#7d7e80'); // Color por defecto
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    birthDate: '',
    avatar: null,
  });

  // Reglas de validacion: cada campo apunta a su funcion validadora
  const validationRules = {
    username: validateUsername,
    fullName: validateFullName,
    email: validateEmail,
    password: validatePassword,
    birthDate: validateBirthDate,
    avatar: validateAvatar,
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: null }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setFormData(prev => ({ ...prev, avatar: file }));
      setAvatarPreview(base64String);
      if (errors.avatar) setErrors(prev => ({ ...prev, avatar: null }));

      // Extraer y aplicar color dominante
      const color = await getDominantColor(base64String);
      setVisualColor(color);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData, validationRules);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          birthDate: formData.birthDate,
          avatarUrl: avatarPreview || ''
        })
      });
      
      const data = await res.json();
      
      if (!data.ok) {
        setErrors({ form: data.message });
        return;
      }
      
      login(data.user);
      navigate('/');
    } catch (error) {
      setErrors({ form: 'Error de conexión con el servidor.' });
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">

        {/* Columna Izquierda */}
        <div 
          className="register-visual" 
          style={{ 
            backgroundColor: visualColor, 
            transition: 'background-color 0.5s ease-in-out' 
          }}
        >
          <div className="avatar-preview-container">
            {avatarPreview
              ? <img src={avatarPreview} alt="Vista previa" />
              : <User size={48} color="rgba(255,255,255,0.4)" />
            }
          </div>
          <p className="register-visual-title">
            {formData.username ? `@${formData.username}` : 'Usuario'}
          </p>
          <p className="register-visual-subtitle">
            {formData.fullName || 'Nombre Completo'}
          </p>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="register-content">
          <h2 className="register-title">Crear Cuenta</h2>

          <form className="register-form" onSubmit={handleSubmit} noValidate>

            {/* Fila 1: Username + Nombre completo */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="username">
                  Nombre de usuario <span>*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  placeholder="ej: d.herrera.1"
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && <p className="error-message">{errors.username}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Nombre completo <span>*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  placeholder="Daniel Herrera Córdoba"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && <p className="error-message">{errors.fullName}</p>}
              </div>
            </div>

            {/* Correo */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Correo electronico <span>*</span>
              </label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="ejemplo@estudiantec.cr"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>

            {/* Fila 2: Password + Fecha */}
            <div className="form-row">
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
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="error-message">{errors.password}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="birthDate">
                  Fecha de nacimiento <span>*</span>
                </label>
                <input
                  id="birthDate"
                  type="date"
                  className={`form-input ${errors.birthDate ? 'error' : ''}`}
                  value={formData.birthDate}
                  onChange={handleChange}
                />
                {errors.birthDate && <p className="error-message">{errors.birthDate}</p>}
              </div>
            </div>

            {/* Avatar */}
            <div className="form-group">
              <label className="form-label">
                Foto de perfil <span style={{ color: '#9ca3af', fontWeight: 400 }}>(opcional, max 2MB)</span>
              </label>
              <label
                htmlFor="avatar"
                className={`avatar-upload-label ${errors.avatar ? 'error' : ''}`}
              >
                <Upload size={18} />
                {formData.avatar ? formData.avatar.name : 'Seleccionar imagen PNG / JPG'}
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                className="avatar-upload-input"
                onChange={handleAvatarChange}
              />
              {errors.avatar && <p className="error-message">{errors.avatar}</p>}
            </div>

            {errors.form && (
              <p className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                {errors.form}
              </p>
            )}

            <button type="submit" className="btn btn-primary" style={{marginTop: '1.5rem', width: '100%'}}>
              Registrarse
            </button>
          </form>

          <div className="register-footer">
            ¿Ya tienes una cuenta? <a href="/login">Iniciar sesion</a>
          </div>
        </div>
      </div>
    </div>
  );
}
