export default function StudentProgress({ student }) {
  if (!student) return null;

  const gradeColor = student.grade === null ? 'var(--muted-foreground)'
    : student.grade >= 70 ? 'var(--success)'
    : student.grade >= 50 ? 'var(--warning)'
    : 'var(--destructive)';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 0',
      fontSize: '0.9rem',
    }}>
      <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{student.fullName}</span>
      <span style={{ color: 'var(--muted-foreground)' }}>{student.email}</span>
      <span style={{
        marginLeft: 'auto',
        fontWeight: 700,
        color: gradeColor,
      }}>
        {student.grade !== null ? student.grade : '—'}
      </span>
    </div>
  );
}
