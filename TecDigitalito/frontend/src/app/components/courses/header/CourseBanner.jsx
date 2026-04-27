import { ArrowLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  if (typeof value === 'object' && value.$date) return new Date(value.$date);
  return null;
}

function formatDate(value) {
  const d = toDate(value);
  if (!d || Number.isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function CourseBanner({ course }) {
  const navigate = useNavigate();
  const courseImage = course?.imageUrl || course?.bannerImageUrl;
  const courseName = course?.courseName || course?.name || 'Curso sin nombre';
  const courseCode = course?.courseCode || course?.code || 'Sin codigo';
  const hasImage = Boolean(courseImage);

  return (
    <div className="course-banner">
      {hasImage ? (
        <img src={courseImage} alt={courseName} className="course-banner-bg" />
      ) : (
        <div className="course-banner-gradient" />
      )}
      <div className="course-banner-overlay" />

      <button className="course-banner-back" onClick={() => navigate('/courses')}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="course-banner-content">
        <span className="course-banner-badge">{courseCode}</span>
        <h1 className="course-banner-title">{courseName}</h1>
        <div className="course-banner-dates">
          <span className="course-banner-date-item">
            <Calendar size={14} /> Inicio: {formatDate(course?.startDate)}
          </span>
          <span className="course-banner-date-item">
            <Calendar size={14} /> Fin: {formatDate(course?.endDate)}
          </span>
        </div>
      </div>
    </div>
  );
}

