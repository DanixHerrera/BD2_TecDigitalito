import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import CourseCard from '../../components/courses/CourseCard';
import Catalog from './Catalog';
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

export default function Courses() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('catalog');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [teachingCourses, setTeachingCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const [enrolled, teaching] = await Promise.all([
        courseService.getEnrolledCourses(),
        courseService.getTeachingCourses(),
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
          <button
            onClick={() => navigate('/courses/create')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} /> Crear Curso
          </button>
        )}
      </header>

      <div className="page-tabs">
        <button onClick={() => setActiveTab('catalog')} className={`page-tab ${activeTab === 'catalog' ? 'active' : ''}`}>
          Catálogo de Cursos
        </button>
        <button onClick={() => setActiveTab('enrolled')} className={`page-tab ${activeTab === 'enrolled' ? 'active' : ''}`}>
          Matriculados
        </button>
        <button onClick={() => setActiveTab('teaching')} className={`page-tab ${activeTab === 'teaching' ? 'active' : ''}`}>
          Impartidos
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'enrolled' && (
          <div className="course-grid">
            {enrolledCourses.map((course) => (
              <CourseCard key={course._id} course={mapCourse(course)} role="Estudiante" />
            ))}
            {enrolledCourses.length === 0 && <p className="empty-state">No estás matriculado en ningún curso.</p>}
          </div>
        )}

        {activeTab === 'teaching' && (
          <div className="course-grid">
            {teachingCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={mapCourse(course)}
                role="Docente"
                onPublishSuccess={loadCourses}
              />
            ))}
            {teachingCourses.length === 0 && <p className="empty-state">No tienes cursos a tu cargo.</p>}
          </div>
        )}

        {activeTab === 'catalog' && (
          <Catalog
            showTitle={false}
            enrolledIds={enrolledCourses.map((course) => course._id)}
            teachingIds={teachingCourses.map((course) => course._id)}
            onEnrollSuccess={loadCourses}
          />
        )}
      </div>
    </div>
  );
}
