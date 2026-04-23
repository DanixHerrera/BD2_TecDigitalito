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
    <div className="courses-page">
      <header className="courses-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>Mis Cursos</h1>
        <p style={{ color: '#64748b' }}></p>
      </header>

      <div className="tabs-nav" style={{ display: 'flex', gap: '2.5rem', marginBottom: '2.5rem', borderBottom: '2px solid #f1f5f9' }}>
        <button
          onClick={() => setActiveTab('catalog')}
          className={activeTab === 'catalog' ? 'tab-active' : 'tab-inactive'}
          style={tabStyle(activeTab === 'catalog')}
        >
          Catálogo de Cursos
        </button>
        <button
          onClick={() => setActiveTab('enrolled')}
          className={activeTab === 'enrolled' ? 'tab-active' : 'tab-inactive'}
          style={tabStyle(activeTab === 'enrolled')}
        >
          Matriculados
        </button>
        <button
          onClick={() => setActiveTab('teaching')}
          className={activeTab === 'teaching' ? 'tab-active' : 'tab-inactive'}
          style={tabStyle(activeTab === 'teaching')}
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

const tabStyle = (isActive) => ({
  padding: '0.75rem 0',
  fontSize: '1rem',
  fontWeight: 600,
  background: 'none',
  border: 'none',
  borderBottom: isActive ? '3px solid #003DA6' : '3px solid transparent',
  color: isActive ? '#003DA6' : '#64748b',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
});
