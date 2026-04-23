import { useState } from 'react';
import { ChevronRight, Calendar, CheckCircle, Circle } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function EvaluationList({ evaluations = [] }) {
  const [expandedId, setExpandedId] = useState(null);

  if (evaluations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📝</div>
        <p className="empty-state-text">No hay evaluaciones creadas</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {evaluations.map((ev) => {
        const isOpen = expandedId === ev.id;
        return (
          <div key={ev.id} className="eval-card">
            <div className="eval-card-header" onClick={() => setExpandedId(isOpen ? null : ev.id)}>
              <div className="eval-card-info">
                <span className="eval-card-title">{ev.title}</span>
                <span className="eval-card-dates">
                  {formatDate(ev.startAt)} — {formatDate(ev.endAt)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="students-count">{ev.questions.length} pregunta{ev.questions.length !== 1 ? 's' : ''}</span>
                <span className={`eval-status ${ev.status}`}>
                  {ev.status === 'finished' ? 'Finalizado' : ev.status === 'active' ? 'Activo' : 'Programado'}
                </span>
                <ChevronRight size={16} className={`tree-chevron ${isOpen ? 'open' : ''}`} />
              </div>
            </div>

            {isOpen && ev.questions.length > 0 && (
              <div className="eval-card-body">
                {ev.questions.map((q, qi) => (
                  <div key={q.id} className="eval-question-item">
                    <p className="eval-question-prompt">{qi + 1}. {q.prompt}</p>
                    <div className="eval-question-options">
                      {q.options.map((opt, oi) => (
                        <span key={oi} className={`eval-option ${oi === q.correctOption ? 'correct' : ''}`}>
                          {oi === q.correctOption ? <CheckCircle size={13} /> : <Circle size={13} />}
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isOpen && ev.questions.length === 0 && (
              <div className="eval-card-body">
                <p className="empty-state-text" style={{ padding: '0.5rem 0' }}>Sin preguntas configuradas</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
