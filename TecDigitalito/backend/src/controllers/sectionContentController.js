const Course = require('../models/Course');
const Section = require('../models/Section');
const SectionContent = require('../models/SectionContent');

async function addContentToSection(req, res) {
  try {
    const { id: sectionId } = req.params;
    const { type, title, value, order } = req.body;

    if (!type || !value) {
      return res.status(400).json({
        ok: false,
        message: 'type y value son requeridos',
      });
    }

    const section = await Section.findById(sectionId);

    if (!section) {
      return res.status(404).json({
        ok: false,
        message: 'Sección no encontrada',
      });
    }

    const course = await Course.findById(section.courseId);

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: 'Curso no encontrado',
      });
    }

    if (course.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permiso para modificar esta sección',
      });
    }

    const content = await SectionContent.create({
      sectionId,
      type,
      title: title || '',
      value,
      order: order || 0,
    });

    return res.status(201).json({
      ok: true,
      message: 'Contenido agregado correctamente',
      content,
    });
  } catch (error) {
    console.error('Error en addContentToSection:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

async function getContentBySection(req, res) {
  try {
    const { id: sectionId } = req.params;

    const section = await Section.findById(sectionId);

    if (!section) {
      return res.status(404).json({
        ok: false,
        message: 'Sección no encontrada',
      });
    }

    const contents = await SectionContent.find({ sectionId }).sort({ order: 1, createdAt: 1 });

    return res.status(200).json({
      ok: true,
      contents,
    });
  } catch (error) {
    console.error('Error en getContentBySection:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

module.exports = {
  addContentToSection,
  getContentBySection,
};