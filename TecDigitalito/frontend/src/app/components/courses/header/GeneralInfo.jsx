import { useState } from 'react';

function buildFormData(course) {
  return {
    courseCode: course.courseCode || course.code || '',
    courseName: course.courseName || course.name || '',
    description: course.description || '',
    startDate: course.startDate ? String(course.startDate).slice(0, 10) : '',
    endDate: course.endDate ? String(course.endDate).slice(0, 10) : '',
    imageUrl: course.imageUrl || course.bannerImageUrl || '',
  };
}

export default function GeneralInfo({ course, isStudent, onContactProfessor, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(() => buildFormData(course));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartEditing = () => {
    setFormData(buildFormData(course));
    setError('');
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setFormData(buildFormData(course));
    setError('');
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const result = await onSave(formData);
    if (result?.ok) {
      setIsEditing(false);
    } else {
      setError(result?.message || 'No se pudo actualizar el curso');
    }

    setSaving(false);
  };

  return (
    <div className="general-info">
      <div className="info-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <h3 className="info-card-title" style={{ marginBottom: 0 }}>Descripción del Curso</h3>
          {!isStudent && (
            <button
              className="btn btn-outline"
              type="button"
              onClick={isEditing ? handleCancelEditing : handleStartEditing}
            >
              {isEditing ? 'Cancelar edición' : 'Editar curso'}
            </button>
          )}
        </div>

        {!isStudent && isEditing ? (
          <form onSubmit={handleSubmit} className="course-form">
            {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Código del Curso</label>
                <input type="text" name="courseCode" className="form-input" value={formData.courseCode} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre del Curso</label>
                <input type="text" name="courseName" className="form-input" value={formData.courseName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Descripción</label>
              <textarea
                name="description"
                className="form-input"
                style={{ minHeight: '120px', resize: 'vertical' }}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Fecha de Inicio</label>
                <input type="date" name="startDate" className="form-input" value={formData.startDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Fin</label>
                <input type="date" name="endDate" className="form-input" value={formData.endDate} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">URL de Imagen</label>
              <input type="url" name="imageUrl" className="form-input" value={formData.imageUrl} onChange={handleChange} />
            </div>

            <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        ) : course.description ? (
          <p className="info-card-description">{course.description}</p>
        ) : (
          <p className="info-card-description" style={{ fontStyle: 'italic', opacity: 0.6 }}>
            Sin descripción disponible
          </p>
        )}
      </div>

      <div className="info-card">
        <h3 className="info-card-title">Detalles del Curso</h3>
        <ul className="info-meta-list">
          <li className="info-meta-item">
            <span className="info-meta-label">Código</span>
            <span className="info-meta-value">{course.courseCode || course.code || '—'}</span>
          </li>
          <li className="info-meta-item">
            <span className="info-meta-label">Inicio</span>
            <span className="info-meta-value">{course.startDate ? new Date(course.startDate).toLocaleDateString('es-CR') : '—'}</span>
          </li>
          <li className="info-meta-item">
            <span className="info-meta-label">Fin</span>
            <span className="info-meta-value">{course.endDate ? new Date(course.endDate).toLocaleDateString('es-CR') : '—'}</span>
          </li>
          {course.professor && (
            <>
              <li className="info-meta-item">
                <span className="info-meta-label">Docente</span>
                <span className="info-meta-value">{course.professor.name}</span>
              </li>
              <li className="info-meta-item">
                <span className="info-meta-label">Correo</span>
                <span className="info-meta-value">{course.professor.email}</span>
              </li>
              {isStudent && (
                <li className="info-meta-item" style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <button className="contact-professor-btn" onClick={onContactProfessor} type="button">
                    Consultar al docente
                  </button>
                </li>
              )}
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
