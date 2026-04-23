import { Link } from 'react-router';
import '@/styles/CourseView.css';

export default function CourseCard({ course, role, onAction }) {
  const card = (
    <div className="course-card">
      <img src={course.img} alt={course.name} className="course-card-image" />
      <div className="course-card-content">
        {role && (
          <span className={`course-card-tag ${role === 'Docente' ? 'tag-professor' : 'tag-student'}`}>
            {role}
          </span>
        )}
        <p className="course-card-code">{course.code || 'IC-XXXX'}</p>
        <h3 className="course-card-name">{course.name}</h3>

        {onAction && (
          <button
            className="login-button"
            style={{ marginTop: '1rem', padding: '0.5rem', fontSize: '0.9rem' }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction(course); }}
          >
            Matricular curso
          </button>
        )}
      </div>
    </div>
  );

  if (onAction) return card;

  return (
    <Link
      to={`/courses/${course.course_id}`}
      state={{ role: role || 'Estudiante' }}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {card}
    </Link>
  );
}
