import { useState, useEffect } from 'react';
import { socialService } from '../../services/socialService';
import { useFriends } from '../../hooks/useFriends';
import { courseService } from '../../services/courseService';
import '@/styles/Social.css';

export default function Students() {
  const [courseId, setCourseId] = useState('');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const { sendRequest, friends } = useFriends();
  const [sentRequests, setSentRequests] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const [enrolledRes, teachingRes] = await Promise.all([
          courseService.getEnrolledCourses(),
          courseService.getTeachingCourses(),
        ]);

        const allCourses = [
          ...(enrolledRes.courses || []),
          ...(teachingRes.courses || []),
        ];

        const uniqueCourses = allCourses.filter(
          (course, index, arr) =>
            arr.findIndex((item) => item._id === course._id) === index
        );

        setCourses(uniqueCourses);
        setCourseId((currentCourseId) => currentCourseId || uniqueCourses[0]?._id || '');
      } catch (error) {
        console.error('Error al cargar cursos para directorio:', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    if (courseId) {
      setLoading(true);
      socialService.getStudentsByCourse(courseId)
        .then(res => setStudents(res || []))
        .finally(() => setLoading(false));
    } else {
      setStudents([]);
    }
  }, [courseId]);

  const handleSendRequest = async (userId) => {
    try {
      await sendRequest(userId);
      setSentRequests(prev => (prev.includes(userId) ? prev : [...prev, userId]));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Directorio de Estudiantes</h1>
      </header>
      
      <div className="search-container">
        <select 
          className="search-input" 
          value={courseId} 
          onChange={e => setCourseId(e.target.value)}
          disabled={loadingCourses || courses.length === 0}
        >
          {courses.length === 0 ? (
            <option value="">
              {loadingCourses ? 'Cargando cursos...' : 'No tienes cursos disponibles'}
            </option>
          ) : (
            courses.map((course) => (
              <option key={course._id} value={course._id}>
                {(course.courseName || course.name)} ({course.courseCode || course.code})
              </option>
            ))
          )}
        </select>
      </div>

      {loading ? (
        <div>Cargando estudiantes...</div>
      ) : (
        <div className="friends-grid">
          {students.map(student => {
            const isFriend = friends.some(f => f.userId === student._id || f.userId === student.userId);
            const userId = student._id || student.userId;
            const requestSent = sentRequests.includes(userId);
            
            return (
              <div key={userId} className="card card-horizontal">
                <div className="avatar avatar-md">
                  {student.fullName ? student.fullName.substring(0, 2).toUpperCase() : student.username.substring(0,2).toUpperCase()}
                </div>
                <div className="friend-info">
                  <div className="friend-name">{student.fullName || student.username}</div>
                  <div className="friend-email">{student.email}</div>
                </div>
                <div className="friend-actions">
                  {isFriend ? (
                    <button className="btn btn-outline" disabled style={{opacity: 0.6}}>Siguiendo</button>
                  ) : requestSent ? (
                    <button className="btn btn-outline" disabled style={{opacity: 0.6}}>Solicitud enviada</button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => handleSendRequest(userId)}>
                      Seguir
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {students.length === 0 && (
            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)'}}>
              No hay estudiantes registrados en este curso.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
