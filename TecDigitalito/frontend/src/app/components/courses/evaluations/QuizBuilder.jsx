import { useState } from 'react';
import { Plus, Trash2, ClipboardList } from 'lucide-react';

const emptyQuestion = () => ({
  id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  prompt: '',
  options: ['', '', '', ''],
  correctOption: 0,
});

export default function QuizBuilder({ onSave }) {
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [questions, setQuestions] = useState([emptyQuestion()]);

  const updateQuestion = (idx, field, value) => {
    const next = [...questions];
    next[idx] = { ...next[idx], [field]: value };
    setQuestions(next);
  };

  const updateOption = (qIdx, oIdx, value) => {
    const next = [...questions];
    const opts = [...next[qIdx].options];
    opts[oIdx] = value;
    next[qIdx] = { ...next[qIdx], options: opts };
    setQuestions(next);
  };

  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const addOption = (qIdx) => {
    const next = [...questions];
    next[qIdx] = { ...next[qIdx], options: [...next[qIdx].options, ''] };
    setQuestions(next);
  };

  const handleSubmit = () => {
    if (!title.trim() || !startAt || !endAt) return;
    const quiz = {
      id: `qz-${Date.now()}`,
      title, startAt, endAt,
      status: 'scheduled',
      questions,
    };
    onSave?.(quiz);
    setTitle('');
    setStartAt('');
    setEndAt('');
    setQuestions([emptyQuestion()]);
  };

  return (
    <div className="quiz-builder-card">
      <h3 className="quiz-builder-title">Crear Nueva Evaluación</h3>

      <div className="quiz-form-row three">
        <div className="quiz-input-group">
          <label className="quiz-label">Nombre de la evaluación</label>
          <input className="quiz-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Quiz 1 - Fundamentos" />
        </div>
        <div className="quiz-input-group">
          <label className="quiz-label">Fecha inicio</label>
          <input className="quiz-input" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        </div>
        <div className="quiz-input-group">
          <label className="quiz-label">Fecha fin</label>
          <input className="quiz-input" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
        </div>
      </div>

      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '0.5rem' }}>Preguntas</h4>

      {questions.map((q, qi) => (
        <div key={q.id} className="quiz-question-card">
          <div className="quiz-question-header">
            <span className="quiz-question-number">Pregunta {qi + 1}</span>
            {questions.length > 1 && (
              <button className="tree-action-btn destructive" onClick={() => removeQuestion(qi)}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className="quiz-input-group" style={{ marginBottom: '0.75rem' }}>
            <input className="quiz-input" value={q.prompt} onChange={(e) => updateQuestion(qi, 'prompt', e.target.value)} placeholder="Escribe la pregunta..." style={{ width: '100%' }} />
          </div>
          {q.options.map((opt, oi) => (
            <div key={oi} className="quiz-option-row">
              <input
                type="radio"
                name={`correct-${q.id}`}
                className="quiz-option-radio"
                checked={q.correctOption === oi}
                onChange={() => updateQuestion(qi, 'correctOption', oi)}
                title="Marcar como correcta"
              />
              <input className="quiz-option-input" value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} placeholder={`Opción ${oi + 1}`} />
            </div>
          ))}
          <button className="quiz-btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => addOption(qi)}>
            <Plus size={12} /> Opción
          </button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button className="quiz-btn-secondary" onClick={addQuestion}>
          <Plus size={14} /> Agregar Pregunta
        </button>
        <button className="quiz-btn-primary" onClick={handleSubmit}>
          Guardar Evaluación
        </button>
      </div>
    </div>
  );
}
