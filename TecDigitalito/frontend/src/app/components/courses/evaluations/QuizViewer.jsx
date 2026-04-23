import { Calendar, CheckCircle, Circle } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function QuizViewer({ quiz }) {
  if (!quiz) return null;

  return (
    <div className="quiz-builder-card">
      <h3 className="quiz-builder-title">{quiz.title}</h3>
      <div className="eval-card-dates" style={{ marginBottom: '1rem' }}>
        <Calendar size={14} />
        {formatDate(quiz.startAt)} — {formatDate(quiz.endAt)}
        <span className={`eval-status ${quiz.status}`} style={{ marginLeft: '0.5rem' }}>
          {quiz.status === 'finished' ? 'Finalizado' : quiz.status === 'active' ? 'Activo' : 'Programado'}
        </span>
      </div>

      {quiz.questions.length === 0 && (
        <p className="empty-state-text">Sin preguntas configuradas</p>
      )}

      {quiz.questions.map((q, qi) => (
        <div key={q.id} className="quiz-question-card">
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
  );
}
