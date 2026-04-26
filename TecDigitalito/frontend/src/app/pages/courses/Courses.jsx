import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import CourseCard from '../../components/courses/CourseCard';
import Catalog from './Catalog';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../hooks/useAuth';
import '@/styles/CourseView.css';

export default function Courses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('catalog');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [teachingCourses, setTeachingCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); 
      
      const [enrolled, teaching] = await Promise.all([
        courseService.getEnrolledCourses(token),
        courseService.getTeachingCourses(token)
      ]);

      setEnrolledCourses(enrolled.courses || []);
      setTeachingCourses(teaching.courses || []);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  if (loading) {
    return <div className="loading-container">Cargando cursos...</div>;
  }

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Mis Cursos</h1>
        {activeTab === 'teaching' && (
          <button onClick={() => navigate('/courses/create')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Crear Curso
          </button>
        )}
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
                key={c._id} 
                course={{ 
                  ...c, 
                  course_id: c._id,
                  name: c.courseName || c.course_name, 
                  code: c.courseCode || c.course_code, 
                  img: c.imageUrl || c.course_image_url || 'https://via.placeholder.com/300x150?text=No+Image'
                }} 
                role="Estudiante" 
              />
            ))}
            {enrolledCourses.length === 0 && <p className="empty-state">No estás matriculado en ningún curso.</p>}
          </div>
        )}
        
        {activeTab === 'teaching' && (
          <div className="course-grid">
            {teachingCourses.map(c => (
              <CourseCard 
                key={c._id} 
                course={{ 
                  ...c, 
                  course_id: c._id,
                  name: c.courseName || c.course_name, 
                  code: c.courseCode || c.course_code, 
                  img: c.imageUrl || c.course_image_url || 'https://via.placeholder.com/300x150?text=No+Image'
                }} 
                role="Docente" 
                onPublishSuccess={loadCourses}
              />
            ))}
            {teachingCourses.length === 0 && <p className="empty-state">No tienes cursos a tu cargo.</p>}
          </div>
        )}

        {activeTab === 'catalog' && (
          <Catalog showTitle={false} />
        )}
      </div>
    </div>
  );
}


