import { useState, useEffect } from 'react';
import CourseCard from '../../components/courses/CourseCard';
import { courseService } from '../../services/courseService';
import '@/styles/CourseView.css';

export default function CourseView() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [teachingCourses, setTeachingCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token'); 
        const [enrolled, teaching] = await Promise.all([
          courseService.getEnrolledCourses(token),
          courseService.getTeachingCourses(token)
        ]);
        setEnrolledCourses(enrolled);
        setTeachingCourses(teaching);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="course-view-container">
      <section className="course-section">
        <h2 className="section-title">Cursos que Imparto</h2>
        <div className="course-grid">
          {teachingCourses.map(c => (
            <CourseCard 
              key={c.course_id} 
              course={{ ...c, name: c.course_name, code: c.course_code, img: c.course_image_url }} 
              role="Docente" 
            />
          ))}
        </div>
      </section>

      <section className="course-section">
        <h2 className="section-title">Mis Cursos Matriculados</h2>
        <div className="course-grid">
          {enrolledCourses.map(c => (
            <CourseCard 
              key={c.course_id} 
              course={{ ...c, name: c.course_name, code: c.course_code, img: c.course_image_url }} 
              role="Estudiante" 
            />
          ))}
        </div>
      </section>
    </div>
  );
}
