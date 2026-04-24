import { useState, useEffect } from 'react';
import { socialService } from '../../services/socialService';
import { useFriends } from '../../hooks/useFriends';
import '@/styles/Social.css';

export default function Students() {
  const [courseId, setCourseId] = useState('mock-course-id');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { sendRequest, friends } = useFriends();

  useEffect(() => {
    if (courseId) {
      setLoading(true);
      socialService.getStudentsByCourse(courseId)
        .then(res => setStudents(res || []))
        .finally(() => setLoading(false));
    }
  }, [courseId]);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Directorio de Estudiantes</h1>
      </header>
      
      <div className="search-container">
        {/* Placeholder para un select de cursos reales */}
        <select 
          className="search-input" 
          value={courseId} 
          onChange={e => setCourseId(e.target.value)}
        >
          <option value="mock-course-id">Bases de Datos II (IC-4302)</option>
        </select>
      </div>

      {loading ? (
        <div>Cargando estudiantes...</div>
      ) : (
        <div className="friends-grid">
          {students.map(student => {
            const isFriend = friends.some(f => f.userId === student._id || f.userId === student.userId);
            
            return (
              <div key={student._id || student.userId} className="card card-horizontal">
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
                  ) : (
                    <button className="btn btn-primary" onClick={() => sendRequest(student._id || student.userId)}>
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
