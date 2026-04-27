import { useEffect, useState } from 'react';
import CourseCard from '../../components/courses/CourseCard';
import { courseService } from '../../services/courseService';
import '@/styles/CourseView.css';

function mapCourse(course) {
  return {
    ...course,
    course_id: course._id,
    name: course.courseName || '',
    code: course.courseCode || '',
    img: course.imageUrl || 'https://via.placeholder.com/300x150?text=No+Image',
  };
}

export default function Catalog({ showTitle = false, enrolledIds = [], teachingIds = [], onEnrollSuccess }) {
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const data = await courseService.getCatalog();
        setCatalogCourses(data.courses || []);
      } catch (error) {
        console.error('Error al cargar catálogo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

  const handleEnroll = async (course) => {
    const result = await courseService.enrollInCourse(course.course_id);
    console.log('[DEBUG enrollInCourse]', {
      action: 'POST /api/courses/:id/enroll',
      courseId: course.course_id,
      courseCode: course.code,
      courseName: course.name,
      response: result,
    });

    if (result.ok) {
      alert(`Matrícula exitosa en ${course.name}`);
      onEnrollSuccess?.();
      return;
    }

    alert(result.message || 'Error en la matrícula');
  };

  if (loading) {
    return <div>Cargando catálogo...</div>;
  }

  return (
    <div className="catalog-container">
      {showTitle && <h2 className="section-title">Catálogo de Cursos</h2>}
      <div className="course-grid">
        {catalogCourses.map((course) => {
          const mappedCourse = mapCourse(course);
          const isEnrolled = enrolledIds.includes(course._id);
          const isTeaching = teachingIds.includes(course._id);

          return (
            <CourseCard
              key={course._id}
              course={mappedCourse}
              onAction={isEnrolled || isTeaching ? null : handleEnroll}
              role={isTeaching ? 'Docente' : isEnrolled ? 'Estudiante' : null}
            />
          );
        })}
        {catalogCourses.length === 0 && <p>No hay cursos disponibles en el catálogo.</p>}
      </div>
    </div>
  );
}
