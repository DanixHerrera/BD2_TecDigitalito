import { ArrowLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function CourseBanner({ course }) {
  const navigate = useNavigate();
  const hasImage = !!course.bannerImageUrl;

  return (
    <div className="course-banner">
      {hasImage ? (
        <img src={course.bannerImageUrl} alt={course.name} className="course-banner-bg" />
      ) : (
        <div className="course-banner-gradient" />
      )}
      <div className="course-banner-overlay" />

      <button className="course-banner-back" onClick={() => navigate('/courses')}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="course-banner-content">
        <span className="course-banner-badge">{course.code}</span>
        <h1 className="course-banner-title">{course.name}</h1>
        <div className="course-banner-dates">
          <span className="course-banner-date-item">
            <Calendar size={14} /> Inicio: {formatDate(course.startDate)}
          </span>
          <span className="course-banner-date-item">
            <Calendar size={14} /> Fin: {formatDate(course.endDate)}
          </span>
        </div>
      </div>
    </div>
  );
}
