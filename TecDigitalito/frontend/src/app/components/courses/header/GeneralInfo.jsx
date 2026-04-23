export default function GeneralInfo({ course }) {
  return (
    <div className="general-info">
      <div className="info-card">
        <h3 className="info-card-title">Descripción del Curso</h3>
        {course.description ? (
          <p className="info-card-description">{course.description}</p>
        ) : (
          <p className="info-card-description" style={{ fontStyle: 'italic', opacity: 0.6 }}>
            Sin descripción disponible
          </p>
        )}
      </div>

      <div className="info-card">
        <h3 className="info-card-title">Detalles del Curso</h3>
        <ul className="info-meta-list">
          {course.professor && (
            <>
              <li className="info-meta-item">
                <span className="info-meta-label">Docente</span>
                <span className="info-meta-value">{course.professor.name}</span>
              </li>
              <li className="info-meta-item">
                <span className="info-meta-label">Correo</span>
                <span className="info-meta-value">{course.professor.email}</span>
              </li>
            </>
          )}
          {course.credits && (
            <li className="info-meta-item">
              <span className="info-meta-label">Créditos</span>
              <span className="info-meta-value">{course.credits}</span>
            </li>
          )}
          {course.semester && (
            <li className="info-meta-item">
              <span className="info-meta-label">Período</span>
              <span className="info-meta-value">{course.semester}</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
