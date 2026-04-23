const Course = require('../models/Course');

async function createCourse(req, res) {
  try {
    const { courseCode, courseName, description, startDate, endDate, imageUrl } = req.body;

    if (!courseCode || !courseName || !description || !startDate) {
      return res.status(400).json({
        ok: false,
        message: 'courseCode, courseName, description y startDate son requeridos',
      });
    }

    const existingCourse = await Course.findOne({ courseCode });

    if (existingCourse) {
      return res.status(409).json({
        ok: false,
        message: 'Ya existe un curso con ese código',
      });
    }

    const course = await Course.create({
      courseCode,
      courseName,
      description,
      startDate,
      endDate: endDate || null,
      imageUrl: imageUrl || '',
      teacherId: req.user.userId,
      published: false,
    });

    return res.status(201).json({
      ok: true,
      message: 'Curso creado correctamente',
      course,
    });
  } catch (error) {
    console.error('Error en createCourse:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

async function getMyCreatedCourses(req, res) {
  try {
    const courses = await Course.find({ teacherId: req.user.userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      courses,
    });
  } catch (error) {
    console.error('Error en getMyCreatedCourses:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

async function getCatalog(req, res) {
  try {
    const courses = await Course.find({ published: true }).sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      courses,
    });
  } catch (error) {
    console.error('Error en getCatalog:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

async function publishCourse(req, res) {
  try {
    const { id } = req.params;

    const course = await Course.findOne({
      _id: id,
      teacherId: req.user.userId,
    });

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: 'Curso no encontrado o no pertenece al usuario',
      });
    }

    course.published = true;
    await course.save();

    return res.status(200).json({
      ok: true,
      message: 'Curso publicado correctamente',
      course,
    });
  } catch (error) {
    console.error('Error en publishCourse:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

module.exports = {
  createCourse,
  getMyCreatedCourses,
  getCatalog,
  publishCourse,
};