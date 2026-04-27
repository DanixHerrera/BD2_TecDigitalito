const Course = require('../models/Course');
const Evaluation = require('../models/Evaluation');
const EvaluationResult = require('../models/EvaluationResult');
const { getCourseAccess } = require('../services/courseAccessService');

function serializeEvaluation(evaluation, isTeacher) {
  const now = new Date();
  let status = 'scheduled';

  if (now >= new Date(evaluation.startDate) && now <= new Date(evaluation.endDate)) {
    status = 'active';
  } else if (now > new Date(evaluation.endDate)) {
    status = 'finished';
  }

  return {
    id: evaluation._id.toString(),
    title: evaluation.title,
    startDate: evaluation.startDate,
    endDate: evaluation.endDate,
    status,
    questions: evaluation.questions.map((question) => ({
      text: question.text,
      options: question.options.map((option) => option.text),
      ...(isTeacher ? { correctOptionIndex: question.correctOptionIndex } : {}),
    })),
  };
}

async function createEvaluation(req, res) {
  try {
    const { id: courseId } = req.params;
    const { title, startDate, endDate, questions } = req.body;

    if (!title || !startDate || !endDate || !questions) {
      return res.status(400).json({
        ok: false,
        message: 'title, startDate, endDate y questions son requeridos',
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: 'Curso no encontrado',
      });
    }

    const access = await getCourseAccess(course, req.user.userId);
    if (!access.canCreateEvaluations) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permiso para crear evaluaciones en este curso',
      });
    }

    const evaluation = await Evaluation.create({
      courseId,
      title,
      startDate,
      endDate,
      questions,
    });

    return res.status(201).json({
      ok: true,
      message: 'Evaluación creada correctamente',
      evaluation,
    });
  } catch (error) {
    console.error('Error en createEvaluation:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

async function getEvaluationsByCourse(req, res) {
  try {
    const { id: courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: 'Curso no encontrado',
      });
    }

    const access = await getCourseAccess(course, req.user.userId);
    if (!access.canViewCourse) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes acceso a las evaluaciones de este curso',
      });
    }

    const evaluations = await Evaluation.find({ courseId }).sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      evaluations: evaluations.map((evaluation) => serializeEvaluation(evaluation, access.isTeacher)),
    });
  } catch (error) {
    console.error('Error en getEvaluationsByCourse:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

async function submitEvaluation(req, res) {
  try {
    const { id: evaluationId } = req.params;
    const { answers } = req.body;
    const studentId = req.user.userId;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        ok: false,
        message: 'answers debe ser un arreglo',
      });
    }

    const evaluation = await Evaluation.findById(evaluationId);

    if (!evaluation) {
      return res.status(404).json({
        ok: false,
        message: 'Evaluación no encontrada',
      });
    }

    const existingResult = await EvaluationResult.findOne({
      evaluationId,
      studentId,
    });

    if (existingResult) {
      return res.status(409).json({
        ok: false,
        message: 'Ya respondiste esta evaluación',
      });
    }

    const now = new Date();
    if (now < new Date(evaluation.startDate) || now > new Date(evaluation.endDate)) {
      return res.status(400).json({
        ok: false,
        message: 'La evaluación no está disponible en este momento',
      });
    }

    const course = await Course.findById(evaluation.courseId);
    if (!course) {
      return res.status(404).json({
        ok: false,
        message: 'Curso no encontrado',
      });
    }

    const access = await getCourseAccess(course, studentId);
    if (!access.isEnrolled) {
      return res.status(403).json({
        ok: false,
        message: 'Debes estar matriculado en el curso para responder la evaluación',
      });
    }

    const gradedAnswers = evaluation.questions.map((question, index) => {
      const studentAnswer = answers.find((a) => a.questionIndex === index);
      const selectedOptionIndex = studentAnswer?.selectedOptionIndex ?? -1;
      const isCorrect = selectedOptionIndex === question.correctOptionIndex;

      return {
        questionIndex: index,
        selectedOptionIndex,
        isCorrect,
      };
    });

    const correctAnswers = gradedAnswers.filter((a) => a.isCorrect).length;
    const totalQuestions = evaluation.questions.length;
    const score = (correctAnswers / totalQuestions) * 100;

    const result = await EvaluationResult.create({
      evaluationId,
      courseId: evaluation.courseId,
      studentId,
      answers: gradedAnswers,
      correctAnswers,
      totalQuestions,
      score,
      submittedAt: new Date(),
    });

    return res.status(201).json({
      ok: true,
      message: 'Evaluación respondida correctamente',
      result,
    });
  } catch (error) {
    console.error('Error en submitEvaluation:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

async function getMyResultsByCourse(req, res) {
  try {
    const { id: courseId } = req.params;
    const studentId = req.user.userId;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: 'Curso no encontrado',
      });
    }

    const access = await getCourseAccess(course, studentId);
    if (!access.canViewOwnResults) {
      return res.status(403).json({
        ok: false,
        message: 'No puedes ver notas de este curso',
      });
    }

    const results = await EvaluationResult.find({
      courseId,
      studentId,
    }).sort({ submittedAt: -1 });

    return res.status(200).json({
      ok: true,
      results: results.map((result) => ({
        id: result._id.toString(),
        evaluationId: result.evaluationId.toString(),
        score: result.score,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        submittedAt: result.submittedAt,
      })),
    });
  } catch (error) {
    console.error('Error en getMyResultsByCourse:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

module.exports = {
  createEvaluation,
  getEvaluationsByCourse,
  submitEvaluation,
  getMyResultsByCourse,
};
