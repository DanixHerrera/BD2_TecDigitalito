
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { socialService } from '../../services/socialService';
import '@/styles/Social.css';

export default function FriendCourses() {
  const { friendId } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [teachingCourseIds, setTeachingCourseIds] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFriendCourses = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await socialService.getFriendCourses(friendId);

        if (!data?.ok) {
          setError(data?.message || 'No se pudieron cargar los cursos del usuario.');
          setCourses([]);
          return;
        }

        setCourses(data.courses || []);
        setTeachingCourseIds(data.teachingCourseIds || []);
        setEnrolledCourseIds(data.enrolledCourseIds || []);
      } catch {
        setError('Error de conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    loadFriendCourses();
  }, [friendId]);

  const getCourseId = (course) => course._id || course.id || course.courseId;

  const getCourseCode = (course) => course.courseCode || course.code || 'SC';

  const isTeachingCourse = (course) => {
    const courseId = getCourseId(course);
    return teachingCourseIds.includes(courseId);
  };

  const isEnrolledCourse = (course) => {
    const courseId = getCourseId(course);
    return enrolledCourseIds.includes(courseId);
  };

  const getRoleLabel = (course) => {
    if (isTeachingCourse(course)) return 'Docente';
    if (isEnrolledCourse(course)) return 'Estudiante';
    return 'Curso';
  };

  const publishedCourses = courses.filter(
    (course) => course.isPublished || course.published || course.status === 'published'
  );

  return (
    <div className="page-container">
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '0.5rem' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="page-title">Cursos del usuario</h1>
      </header>

      {loading && <div>Cargando cursos...</div>}

      {!loading && error && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && publishedCourses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
          Este usuario no tiene cursos para mostrar.
        </div>
      )}

      {!loading && !error && publishedCourses.length > 0 && (
        <div className="friend-course-list">
          {publishedCourses.map((course) => {
            const courseId = getCourseId(course);
            const code = getCourseCode(course);

            return (
              <div key={courseId} className="friend-course-row">
                <div className="friend-course-code-pill">
                  {code}
                </div>

                <div className="friend-course-info">
                  <h3>{course.courseName || course.name || 'Curso sin nombre'}</h3>
                </div>

                <div className="friend-course-role">
                  {getRoleLabel(course)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}