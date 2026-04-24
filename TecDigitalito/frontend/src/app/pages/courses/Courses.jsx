import { useState, useEffect } from 'react';
import CourseCard from '../../components/courses/CourseCard';
import Catalog from './Catalog';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../hooks/useAuth';
import '@/styles/CourseView.css';

export default function Courses() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [teachingCourses, setTeachingCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        // En una implementación real, el token vendría del contexto de autenticación
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

  if (loading) {
    return <div className="loading-container">Cargando cursos...</div>;
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Mis Cursos</h1>
      </header>

      <div className="page-tabs">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`page-tab ${activeTab === 'catalog' ? 'active' : ''}`}
        >
          Catálogo de Cursos
        </button>
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`page-tab ${activeTab === 'enrolled' ? 'active' : ''}`}
        >
          Matriculados
        </button>
        <button
          onClick={() => setActiveTab('teaching')}
          className={`page-tab ${activeTab === 'teaching' ? 'active' : ''}`}
        >
          Impartidos
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'enrolled' && (
          <div className="course-grid">
            {enrolledCourses.map(c => (
              <CourseCard 
                key={c.course_id} 
                course={{ ...c, name: c.course_name, code: c.course_code, img: c.course_image_url }} 
                role="Estudiante" 
              />
            ))}
            {enrolledCourses.length === 0 && <p>No estás matriculado en ningún curso.</p>}
          </div>
        )}
        
        {activeTab === 'teaching' && (
          <div className="course-grid">
            {teachingCourses.map(c => (
              <CourseCard 
                key={c.course_id} 
                course={{ ...c, name: c.course_name, code: c.course_code, img: c.course_image_url }} 
                role="Docente" 
              />
            ))}
            {teachingCourses.length === 0 && <p>No tienes cursos a tu cargo.</p>}
          </div>
        )}

        {activeTab === 'catalog' && (
          <Catalog showTitle={false} />
        )}
      </div>
    </div>
  );
}


