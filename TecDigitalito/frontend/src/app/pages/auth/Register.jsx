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
import '../../../styles/Register.css';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, avatar: file }));
    setAvatarPreview(URL.createObjectURL(file));
    if (errors.avatar) setErrors(prev => ({ ...prev, avatar: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData, validationRules);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    /* 
       Como hacer el FETCH (FormData): -> Agregando un archivo como lo es el avatar 
       const data = new FormData();
       data.append('NOMBRE_CAMPO', 'VALOR');
       data.append('ARCHIVO', fileObject);
    
       Como hacer el FETCH (FormData):
       fetch('URL_BASE_DE_DATOS_O_API', {
         method: 'POST',
         body: data // El navegador pone el Content-Type automaticamente
       })
    */

    // Simulacion del registro iniciando sesión directamente
    login({
      username: formData.username,
      name: formData.fullName,
      email: formData.email,
      avatar: avatarPreview,
      role: 'student',
    });

    navigate('/');
  };

  return (
    <div className="register-container">
      <div className="register-card">

        {/* Columna Izquierda */}
        <div className="register-visual">
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
                  className={`register-input ${errors.username ? 'error' : ''}`}
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
                  className={`register-input ${errors.fullName ? 'error' : ''}`}
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
                className={`register-input ${errors.email ? 'error' : ''}`}
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
                  Contrasena <span>*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`register-input ${errors.password ? 'error' : ''}`}
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
                  className={`register-input ${errors.birthDate ? 'error' : ''}`}
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

            <button type="submit" className="register-button">
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
