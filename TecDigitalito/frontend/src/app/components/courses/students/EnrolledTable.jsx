import { useState } from 'react';
import { Search } from 'lucide-react';

function getInitials(name) {
  const safeName = (name || '').trim();
  if (!safeName) return '??';
  return safeName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function gradeClass(grade) {
  if (grade === null || grade === undefined) return 'none';
  if (grade >= 70) return 'high';
  if (grade >= 50) return 'mid';
  return 'low';
}

export default function EnrolledTable({ students = [] }) {
  const [search, setSearch] = useState('');

  const filtered = students.filter((student) => {
    const fullName = (student.fullName || student.username || '').toLowerCase();
    const email = (student.email || '').toLowerCase();
    const query = search.toLowerCase();

    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div className="students-wrapper">
      <div className="students-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="students-title">Estudiantes Matriculados</span>
          <span className="students-count">{students.length} total</span>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
          <input
            className="students-search"
            style={{ paddingLeft: '2rem' }}
            placeholder="Buscar estudiante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p className="empty-state-text">
            {students.length === 0 ? 'No hay estudiantes matriculados' : 'Sin resultados para la búsqueda'}
          </p>
        </div>
      ) : (
        <table className="students-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Correo</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id || s.userId}>
                <td>
                  <div className="student-name-cell">
                    {s.avatarUrl ? (
                      <img src={s.avatarUrl} alt={s.fullName || s.username} className="student-avatar" style={{ objectFit: 'cover' }} />
                    ) : (
                      <span className="student-avatar">{getInitials(s.fullName || s.username)}</span>
                    )}
                    {s.fullName || s.username}
                  </div>
                </td>
                <td><span className="student-email">{s.email}</span></td>
                <td>
                  <span className={`grade-badge ${gradeClass(s.grade)}`}>
                    {s.grade !== null && s.grade !== undefined ? s.grade : '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
