import { useMemo, useState } from 'react';
import { CheckCircle, ChevronRight, Circle } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EvaluationList({
  evaluations = [],
  isTeacher = false,
  results = [],
  onSubmit,
  submittingId = null,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [draftAnswers, setDraftAnswers] = useState({});

  const resultsByEvaluation = useMemo(
    () => Object.fromEntries(results.map((result) => [result.evaluationId, result])),
    [results]
  );

  const updateAnswer = (evaluationId, questionIndex, selectedOptionIndex) => {
    setDraftAnswers((prev) => ({
      ...prev,
      [evaluationId]: {
        ...(prev[evaluationId] || {}),
        [questionIndex]: selectedOptionIndex,
      },
    }));
  };

  const handleSubmit = async (evaluationId) => {
    const answers = Object.entries(draftAnswers[evaluationId] || {}).map(([questionIndex, selectedOptionIndex]) => ({
      questionIndex: Number(questionIndex),
      selectedOptionIndex,
    }));

    await onSubmit?.(evaluationId, answers);
  };

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
      {evaluations.map((evaluation) => {
        const isOpen = expandedId === evaluation.id;
        const myResult = resultsByEvaluation[evaluation.id];
        const isSubmitted = Boolean(myResult);
        const canAnswer = !isTeacher && evaluation.status === 'active' && !isSubmitted;

        return (
          <div key={evaluation.id} className="eval-card">
            <div className="eval-card-header" onClick={() => setExpandedId(isOpen ? null : evaluation.id)}>
              <div className="eval-card-info">
                <span className="eval-card-title">{evaluation.title}</span>
                <span className="eval-card-dates">
                  {formatDate(evaluation.startDate)} - {formatDate(evaluation.endDate)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {!isTeacher && isSubmitted && (
                  <span className="students-count">Nota: {Math.round(myResult.score)}</span>
                )}
                <span className="students-count">
                  {evaluation.questions.length} pregunta{evaluation.questions.length !== 1 ? 's' : ''}
                </span>
                <span className={`eval-status ${evaluation.status}`}>
                  {evaluation.status === 'finished' ? 'Finalizado' : evaluation.status === 'active' ? 'Activo' : 'Programado'}
                </span>
                <ChevronRight size={16} className={`tree-chevron ${isOpen ? 'open' : ''}`} />
              </div>
            </div>

            {isOpen && (
              <div className="eval-card-body">
                {evaluation.questions.map((question, questionIndex) => (
                  <div key={`${evaluation.id}-${questionIndex}`} className="eval-question-item">
                    <p className="eval-question-prompt">{questionIndex + 1}. {question.text}</p>
                    <div className="eval-question-options">
                      {question.options.map((option, optionIndex) => {
                        if (isTeacher) {
                          const isCorrect = optionIndex === question.correctOptionIndex;
                          return (
                            <span key={optionIndex} className={`eval-option ${isCorrect ? 'correct' : ''}`}>
                              {isCorrect ? <CheckCircle size={13} /> : <Circle size={13} />}
                              {option}
                            </span>
                          );
                        }

                        return (
                          <label key={optionIndex} className="eval-option" style={{ cursor: canAnswer ? 'pointer' : 'default' }}>
                            <input
                              type="radio"
                              name={`evaluation-${evaluation.id}-question-${questionIndex}`}
                              checked={(draftAnswers[evaluation.id] || {})[questionIndex] === optionIndex}
                              onChange={() => updateAnswer(evaluation.id, questionIndex, optionIndex)}
                              disabled={!canAnswer}
                              style={{ marginRight: '0.4rem' }}
                            />
                            {option}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!isTeacher && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', paddingTop: '1rem' }}>
                    <div className="students-count">
                      {isSubmitted
                        ? `Respondida el ${formatDate(myResult.submittedAt)}`
                        : evaluation.status === 'scheduled'
                          ? 'La evaluación aún no está disponible.'
                          : evaluation.status === 'finished'
                            ? 'La evaluación ya cerró.'
                            : 'Selecciona una respuesta por pregunta y envía tu intento.'}
                    </div>
                    {canAnswer && (
                      <button
                        className="quiz-btn-primary"
                        type="button"
                        onClick={() => handleSubmit(evaluation.id)}
                        disabled={submittingId === evaluation.id}
                      >
                        {submittingId === evaluation.id ? 'Enviando...' : 'Responder evaluación'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
