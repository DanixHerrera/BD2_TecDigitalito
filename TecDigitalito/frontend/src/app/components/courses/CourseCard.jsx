import { Link } from 'react-router';
import { courseService } from '../../services/courseService';
import '@/styles/CourseView.css';

export default function CourseCard({ course, role, onAction, onPublishSuccess }) {
  const normalizedCourse = {
    ...course,
    course_id: course?.course_id || course?._id || course?.id,
  };

  const handlePublish = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!normalizedCourse.course_id) {
      alert('No se pudo publicar: curso sin id');
      return;
    }

    const result = await courseService.publishCourse(normalizedCourse.course_id);
    if (result.ok) {
      alert('Curso publicado con Ã©xito');
      onPublishSuccess?.();
      return;
    }

    alert(result.message || 'Error al publicar');
  };

  const card = (
    <div className="card">
      <img
        src={normalizedCourse.img}
        alt={normalizedCourse.name}
        className="course-card-image"
      />
      <div className="course-card-content">
        {role && (
          <span
            className={`course-card-tag ${role === 'Docente' ? 'tag-professor' : 'tag-student'}`}
          >
            {role}
          </span>
        )}
        <p className="course-card-code">{normalizedCourse.code || 'IC-XXXX'}</p>
        <h3 className="course-card-name">{normalizedCourse.name}</h3>

        {onAction && (
          <button
            className="btn btn-primary"
            style={{ marginTop: '1rem', width: '100%' }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onAction(normalizedCourse);
            }}
            disabled={!normalizedCourse.course_id}
          >
            Matricular curso
          </button>
        )}

        {role === 'Docente' && !normalizedCourse.published && (
          <button
            className="btn btn-outline"
            style={{
              marginTop: '1rem',
              width: '100%',
              borderColor: '#f59e0b',
              color: '#f59e0b',
            }}
            onClick={handlePublish}
            disabled={!normalizedCourse.course_id}
          >
            Publicar Curso
          </button>
        )}

        {role === 'Docente' && (
          <button
            className="btn btn-outline"
            style={{
              marginTop: '0.5rem',
              width: '100%',
              borderColor: '#6366f1',
              color: '#6366f1',
            }}
            onClick={async (event) => {
              event.preventDefault();
              event.stopPropagation();
              const newCode = prompt('Ingresa el codigo para el curso clonado (ej: IC-2025-CLON):');
              if (!newCode) return;
              const result = await courseService.cloneCourse(normalizedCourse.course_id, newCode.trim());
              if (result.ok) {
                alert('¡Curso clonado con exito!');
                onPublishSuccess?.();
              } else {
                alert(result.message || 'Error al clonar');
              }
            }}
          >
            Clonar Curso
          </button>
        )}
      </div>
    </div>
  );

  if (onAction) {
    return card;
  }

  if (!normalizedCourse.course_id) {
    return card;
  }

  return (
    <Link
      to={`/courses/${normalizedCourse.course_id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {card}
    </Link>
  );
}

