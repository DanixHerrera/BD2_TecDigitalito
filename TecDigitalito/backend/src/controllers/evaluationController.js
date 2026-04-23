const Course = require('../models/Course');
const Evaluation = require('../models/Evaluation');
const EvaluationResult = require('../models/EvaluationResult');
const { driver } = require('../databases/neo4j');

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

    if (course.teacherId.toString() !== req.user.userId) {
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

    const evaluations = await Evaluation.find({ courseId }).sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      evaluations,
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
  const neoSession = driver.session();

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
  return res.status(400).json({
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

    const enrollmentCheck = await neoSession.run(
      `
      MATCH (u:User {id: $studentId})-[:ENROLLED_IN]->(c:Course {id: $courseId})
      RETURN c
      `,
      {
        studentId,
        courseId: evaluation.courseId.toString(),
      }
    );

    if (enrollmentCheck.records.length === 0) {
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
  } finally {
    await neoSession.close();
  }
}

async function getMyResultsByCourse(req, res) {
  try {
    const { id: courseId } = req.params;
    const studentId = req.user.userId;

    const results = await EvaluationResult.find({
      courseId,
      studentId,
    }).sort({ submittedAt: -1 });

    return res.status(200).json({
      ok: true,
      results,
    });
  } catch (error) {
    console.error('Error en getMyResultsByCourse:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}
async function getEvaluationResults(req, res) {
  try {
    const { id: evaluationId } = req.params;
    const teacherId = req.user.userId;

    const evaluation = await Evaluation.findById(evaluationId);

    if (!evaluation) {
      return res.status(404).json({
        ok: false,
        message: 'Evaluación no encontrada',
      });
    }

    const course = await Course.findById(evaluation.courseId);

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: 'Curso no encontrado',
      });
    }

    if (course.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permiso para ver estos resultados',
      });
    }

    const results = await EvaluationResult.find({ evaluationId })
      .populate('studentId', 'username fullName email')
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      ok: true,
      evaluation: {
        _id: evaluation._id,
        title: evaluation.title,
        courseId: evaluation.courseId,
      },
      results,
    });
  } catch (error) {
    console.error('Error en getEvaluationResults:', error);
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
  getEvaluationResults,
};