import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { courseService } from '../../services/courseService';
import '@/styles/CourseView.css';

export default function CourseCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    description: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await courseService.createCourse(formData);
      if (result.ok) {
        navigate('/courses');
      } else {
        setError(result.message || 'Error al crear el curso');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title">Crear Nuevo Curso</h1>
      </header>

      <div className="card" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
        {error && <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Código del Curso *</label>
              <input
                type="text"
                name="courseCode"
                className="form-input"
                placeholder="ej: IC-4302"
                value={formData.courseCode}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre del Curso *</label>
              <input
                type="text"
                name="courseName"
                className="form-input"
                placeholder="ej: Bases de Datos II"
                value={formData.courseName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Descripción *</label>
            <textarea
              name="description"
              className="form-input"
              style={{ minHeight: '120px', resize: 'vertical' }}
              placeholder="Describe los objetivos y contenidos del curso..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Fecha de Inicio *</label>
              <input type="date" name="startDate" className="form-input" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de Fin</label>
              <input type="date" name="endDate" className="form-input" value={formData.endDate} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">URL de Imagen de Portada</label>
            <input
              type="url"
              name="imageUrl"
              className="form-input"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={() => navigate('/courses')} className="btn btn-outline">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Curso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
