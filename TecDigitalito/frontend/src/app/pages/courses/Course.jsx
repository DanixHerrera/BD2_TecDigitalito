import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import CourseBanner from '../../components/courses/header/CourseBanner';
import GeneralInfo from '../../components/courses/header/GeneralInfo';
import ContentArea from '../../components/courses/sections/ContentArea';
import QuizBuilder from '../../components/courses/evaluations/QuizBuilder';
import EvaluationList from '../../components/courses/evaluations/EvaluationList';
import EnrolledTable from '../../components/courses/students/EnrolledTable';
import { courseService } from '../../services/courseService';
import { evaluationService } from '../../services/evaluationService';
import { messageService } from '../../services/messageService';
import '@/styles/CourseDetail.css';

const TABS = [
  { id: 'info', label: 'Información General' },
  { id: 'content', label: 'Contenido' },
  { id: 'evaluations', label: 'Evaluaciones' },
  { id: 'students', label: 'Estudiantes' },
];

export default function Course() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [evaluations, setEvaluations] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [submittingEvaluationId, setSubmittingEvaluationId] = useState(null);

  const normalizeCourse = (rawCourse, sections = []) => {
    const courseName = rawCourse?.courseName || rawCourse?.name || '';
    const courseCode = rawCourse?.courseCode || rawCourse?.code || '';
    const imageUrl = rawCourse?.imageUrl || rawCourse?.bannerImageUrl || '';

    return {
      ...rawCourse,
      courseName,
      courseCode,
      imageUrl,
      bannerImageUrl: imageUrl,
      startDate: rawCourse?.startDate ?? null,
      endDate: rawCourse?.endDate ?? null,
      name: courseName,
      code: courseCode,
      contentTree: sections,
    };
  };

  const permissions = course?.permissions || {};
  const isTeacher = Boolean(permissions.isTeacher);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [courseResponse, evaluationsResponse, resultsResponse] = await Promise.all([
          courseService.getCourseById(courseId),
          evaluationService.getByCourse(courseId),
          evaluationService.getMyResults(courseId),
        ]);

        if (courseResponse?.ok) {
          setCourse(normalizeCourse(courseResponse.course, courseResponse.sections || []));
        } else {
          setCourse(null);
        }

        if (evaluationsResponse?.ok) {
          setEvaluations(evaluationsResponse.evaluations || []);
        } else {
          setEvaluations([]);
        }

        if (resultsResponse?.ok) {
          setMyResults(resultsResponse.results || []);
        } else {
          setMyResults([]);
        }
      } catch (error) {
        console.error('Error al cargar el curso:', error);
        setCourse(null);
        setEvaluations([]);
        setMyResults([]);
      }

      setLoading(false);
    };

    load();
  }, [courseId]);

  const handleSaveCourse = async (formData) => {
    const result = await courseService.updateCourse(courseId, formData);

    if (result?.ok && result.course) {
      setCourse((prev) => normalizeCourse({ ...prev, ...result.course }, prev?.contentTree || []));
    }

    return result;
  };

  const handleSaveQuiz = async (payload) => {
    const result = await evaluationService.create(courseId, payload);

    if (result?.ok && result.evaluation) {
      const refresh = await evaluationService.getByCourse(courseId);
      if (refresh?.ok) {
        setEvaluations(refresh.evaluations || []);
      }
    }

    return result;
  };

  const handleSubmitEvaluation = async (evaluationId, answers) => {
    setSubmittingEvaluationId(evaluationId);
    const result = await evaluationService.submit(evaluationId, answers);

    if (result?.ok) {
      const refreshResults = await evaluationService.getMyResults(courseId);
      if (refreshResults?.ok) {
        setMyResults(refreshResults.results || []);
      }
    }

    setSubmittingEvaluationId(null);
    return result;
  };

  const handleContactProfessor = async () => {
    if (course && course.professor && course.professor.id) {
      try {
        const userId = course.professor.id;
        const conversation = await messageService.startConversationWithUser(userId);
        const conversationId = conversation?.id || conversation?.['@metadata']?.['@id'];

        if (!conversationId) {
          console.error('No se pudo crear o recuperar la conversacion');
          return;
        }

        const params = new URLSearchParams({ 
          contactUserId: userId,
          contactName: course.professor.name
        });
        params.set('conversationId', conversationId);

        navigate(`/social/user-messages?${params.toString()}`, {
          state: { contactUserId: userId, conversationId, contactName: course.professor.name },
        });
      } catch (error) {
        console.error('Error abriendo chat con profesor:', error);
      }
    } else {
      console.warn("No se puede contactar al docente: ID no disponible.");
    }
  };

  const handleSaveContent = async (tree) => {
    const result = await courseService.saveContentTree(courseId, tree);
    if (result?.ok) {
      const refresh = await courseService.getCourseById(courseId);
      if (refresh?.ok) {
        setCourse(normalizeCourse(refresh.course, refresh.sections || []));
      }
    } else {
      console.error("Hubo un error guardando el contenido: ", result?.message);
    }
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
        {activeTab === 'info' && (
          <GeneralInfo 
            course={course} 
            isStudent={!isTeacher} 
            onContactProfessor={handleContactProfessor} 
            onSave={handleSaveCourse}
          />
        )}

        {activeTab === 'content' && (
          <ContentArea 
            contentTree={course.contentTree} 
            isEditable={Boolean(permissions.canManageContent)} 
            onSaveContent={handleSaveContent}
          />
        )}

        {activeTab === 'evaluations' && (
          <div className="evaluations-wrapper">
            {Boolean(permissions.canCreateEvaluations) && <QuizBuilder onSave={handleSaveQuiz} />}
            <EvaluationList
              evaluations={evaluations}
              isTeacher={isTeacher}
              results={myResults}
              onSubmit={handleSubmitEvaluation}
              submittingId={submittingEvaluationId}
            />
          </div>
        )}

        {activeTab === 'students' && (
          <EnrolledTable students={course.enrolledStudents} />
        )}
      </div>
    </div>
  );
}
