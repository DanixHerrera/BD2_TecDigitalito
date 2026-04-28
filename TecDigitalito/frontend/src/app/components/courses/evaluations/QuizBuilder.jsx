import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const createEmptyQuestion = () => ({
  id: `q-${crypto.randomUUID()}`,
  text: '',
  options: ['', ''],
  correctOptionIndex: 0,
});

export default function QuizBuilder({ onSave }) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [questions, setQuestions] = useState(() => [createEmptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const now = new Date().toISOString().slice(0, 16);

  const requiredFieldsFilled =
    title.trim() &&
    startDate &&
    endDate;

  const datesAreValid =
    startDate >= now &&
    endDate >= startDate;

  const questionsAreValid = questions.every((q) =>
    q.text.trim() &&
    q.options.filter((o) => o.trim()).length >= 2 &&
    q.correctOptionIndex < q.options.filter((o) => o.trim()).length
  );

  const canSubmit =
    requiredFieldsFilled &&
    datesAreValid &&
    questionsAreValid &&
    !saving;

  const updateQuestion = (index, patch) => {
    setQuestions((prev) =>
      prev.map((question, currentIndex) =>
        currentIndex === index ? { ...question, ...patch } : question
      )
    );
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((question, currentIndex) => {
        if (currentIndex !== questionIndex) return question;

        const nextOptions = question.options.map((option, currentOptionIndex) =>
          currentOptionIndex === optionIndex ? value : option
        );

        return { ...question, options: nextOptions };
      })
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion()]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

  const addOption = (questionIndex) => {
    setQuestions((prev) =>
      prev.map((question, currentIndex) =>
        currentIndex === questionIndex
          ? { ...question, options: [...question.options, ''] }
          : question
      )
    );
  };

  const handleSubmit = async () => {
    setError('');

    if (!canSubmit) {
      setError('Verifica datos, fechas y preguntas.');
      return;
    }

    const payload = {
      title: title.trim(),
      startDate,
      endDate,
      questions: questions.map((question) => ({
        text: question.text.trim(),
        options: question.options
          .map((option) => option.trim())
          .filter(Boolean)
          .map((text) => ({ text })),
        correctOptionIndex: question.correctOptionIndex,
      })),
    };

    setSaving(true);
    const result = await onSave(payload);
    setSaving(false);

    if (!result?.ok) {
      setError(result?.message || 'No se pudo crear la evaluación');
      return;
    }

    setTitle('');
    setStartDate('');
    setEndDate('');
    setQuestions([createEmptyQuestion()]);
  };

  return (
    <div className="quiz-builder-card">
      <h3 className="quiz-builder-title">Crear Nueva Evaluación</h3>
      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="quiz-form-row three">
        <div className="quiz-input-group">
          <label className="quiz-label">Nombre de la evaluación</label>
          <input
            className="quiz-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej: Quiz 1 - Fundamentos"
          />
        </div>

        <div className="quiz-input-group">
          <label className="quiz-label">Fecha inicio</label>
          <input
            className="quiz-input"
            type="datetime-local"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            min={now}
          />
        </div>

        <div className="quiz-input-group">
          <label className="quiz-label">Fecha fin</label>
          <input
            className="quiz-input"
            type="datetime-local"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            min={startDate || now}
          />
        </div>
      </div>

      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '0.5rem' }}>
        Preguntas
      </h4>

      {questions.map((question, questionIndex) => (
        <div key={question.id} className="quiz-question-card">
          <div className="quiz-question-header">
            <span className="quiz-question-number">Pregunta {questionIndex + 1}</span>
            {questions.length > 1 && (
              <button className="tree-action-btn destructive" type="button" onClick={() => removeQuestion(questionIndex)}>
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <div className="quiz-input-group" style={{ marginBottom: '0.75rem' }}>
            <input
              className="quiz-input"
              value={question.text}
              onChange={(event) => updateQuestion(questionIndex, { text: event.target.value })}
              placeholder="Escribe la pregunta..."
              style={{ width: '100%' }}
            />
          </div>

          {question.options.map((option, optionIndex) => (
            <div key={`${question.id}-${optionIndex}`} className="quiz-option-row">
              <input
                type="radio"
                name={`correct-${question.id}`}
                className="quiz-option-radio"
                checked={question.correctOptionIndex === optionIndex}
                onChange={() => updateQuestion(questionIndex, { correctOptionIndex: optionIndex })}
              />
              <input
                className="quiz-option-input"
                value={option}
                onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                placeholder={`Opción ${optionIndex + 1}`}
              />
            </div>
          ))}

          <button className="quiz-btn-secondary" type="button" onClick={() => addOption(questionIndex)}>
            <Plus size={12} /> Opción
          </button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button className="quiz-btn-secondary" type="button" onClick={addQuestion}>
          <Plus size={14} /> Agregar Pregunta
        </button>

        <button className="quiz-btn-primary" type="button" onClick={handleSubmit} disabled={!canSubmit}>
          {saving ? 'Guardando...' : 'Guardar Evaluación'}
        </button>
      </div>
    </div>
  );
}