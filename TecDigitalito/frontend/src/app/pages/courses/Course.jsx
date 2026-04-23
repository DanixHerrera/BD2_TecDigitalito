import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router';
import { Info, BookOpen, ClipboardList, Users } from 'lucide-react';
import CourseBanner from '../../components/courses/header/CourseBanner';
import GeneralInfo from '../../components/courses/header/GeneralInfo';
import ContentArea from '../../components/courses/sections/ContentArea';
import QuizBuilder from '../../components/courses/evaluations/QuizBuilder';
import EvaluationList from '../../components/courses/evaluations/EvaluationList';
import EnrolledTable from '../../components/courses/students/EnrolledTable';
import { courseService } from '../../services/courseService';
import '@/styles/CourseDetail.css';

const TABS = [
  { id: 'info', label: 'Información General' },
  { id: 'content', label: 'Contenido' },
  { id: 'evaluations', label: 'Evaluaciones' },
  { id: 'students', label: 'Estudiantes' },
];

export default function Course() {
  const { courseId } = useParams();
  const location = useLocation();
  const role = location.state?.role || 'Docente';
  const isEditable = role === 'Docente';

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await courseService.getCourseById(courseId, token);
      setCourse(data);
      if (data) setEvaluations(data.evaluations || []);
      setLoading(false);
    };
    load();
  }, [courseId]);

  const handleSaveQuiz = (quiz) => {
    setEvaluations(prev => [...prev, quiz]);
  };

  if (loading) {
    return <div className="course-loading">Cargando curso...</div>;
  }

  if (!course) {
    return (
      <div className="course-not-found">
        <h2>Curso no encontrado</h2>
        <p>El curso solicitado no existe o no tienes acceso.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0.5rem' }}>
      <CourseBanner course={course} />

      <div className="course-tabs">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            className={`course-tab ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="course-tab-content">
        {activeTab === 'info' && <GeneralInfo course={course} />}

        {activeTab === 'content' && (
          <ContentArea contentTree={course.contentTree} isEditable={isEditable} />
        )}

        {activeTab === 'evaluations' && (
          <div className="evaluations-wrapper">
            {isEditable && <QuizBuilder onSave={handleSaveQuiz} />}
            <EvaluationList evaluations={evaluations} />
          </div>
        )}

        {activeTab === 'students' && (
          <EnrolledTable students={course.enrolledStudents} />
        )}
      </div>
    </div>
  );
}
