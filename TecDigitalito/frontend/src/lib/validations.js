/**
 * Utilidades de validacion modulares y reutilizables.
 */

export const validateEmail = (email) => {
  if (!email) return 'El correo electrónico es requerido.';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Ingresa un formato de correo válido (ej: usuario@estudiantec.cr).';
  }

  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'La contraseña es requerida.';
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  return null;
};

export const validateUsername = (username) => {
  if (!username) return 'El nombre de usuario es requerido.';
  if (username.length < 3) return 'El usuario debe tener al menos 3 caracteres.';
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) return 'Solo se permiten letras, numeros, puntos y guiones bajos.';
  return null;
};

export const validateFullName = (name) => {
  if (!name) return 'El nombre completo es requerido.';
  if (name.trim().split(' ').length < 2) return 'Ingresa tu nombre y apellido.';
  return null;
};

export const validateBirthDate = (date) => {
  if (!date) return 'La fecha de nacimiento es requerida.';
  const birth = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  if (age < 17) return 'Debes tener al menos 17 anos para registrarte.';
  if (age > 100) return 'Ingresa una fecha valida.';
  return null;
};

export const validateAvatar = (file) => {
  if (!file) return null; // Opcional
  if (!file.type.startsWith('image/')) return 'El archivo debe ser una imagen.';
  if (file.size > 5 * 1024 * 1024) return 'La imagen no debe superar los 5MB.';
  return null;
};

/**
 * Validador generico para formularios.
 * Recibe un objeto con los campos y un objeto con las reglas.
 */
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const error = rules[field](data[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

