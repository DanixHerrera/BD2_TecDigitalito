const Course = require('../models/Course');
const Section = require('../models/Section');

async function createSection(req, res) {
  try {
    const { id: courseId } = req.params;
    const { title, description, parentSectionId, order } = req.body;

    if (!title) {
      return res.status(400).json({
        ok: false,
        message: 'title es requerido',
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
        message: 'No tienes permiso para modificar este curso',
      });
    }

    if (parentSectionId) {
      const parentSection = await Section.findById(parentSectionId);

      if (!parentSection) {
        return res.status(404).json({
          ok: false,
          message: 'La sección padre no existe',
        });
      }

      if (parentSection.courseId.toString() !== courseId) {
        return res.status(400).json({
          ok: false,
          message: 'La sección padre no pertenece a este curso',
        });
      }
    }

    const section = await Section.create({
      courseId,
      parentSectionId: parentSectionId || null,
      title,
      description: description || '',
      order: order || 0,
    });

    return res.status(201).json({
      ok: true,
      message: 'Sección creada correctamente',
      section,
    });
  } catch (error) {
    console.error('Error en createSection:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

function buildSectionTree(sections, parentId = null) {
  return sections
    .filter(
      (section) =>
        (section.parentSectionId === null && parentId === null) ||
        (section.parentSectionId !== null &&
          section.parentSectionId.toString() === parentId)
    )
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      _id: section._id,
      courseId: section.courseId,
      parentSectionId: section.parentSectionId,
      title: section.title,
      description: section.description,
      order: section.order,
      children: buildSectionTree(sections, section._id.toString()),
    }));
}

async function getSectionsByCourse(req, res) {
  try {
    const { id: courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: 'Curso no encontrado',
      });
    }

    const sections = await Section.find({ courseId });

    const tree = buildSectionTree(sections);

    return res.status(200).json({
      ok: true,
      sections: tree,
    });
  } catch (error) {
    console.error('Error en getSectionsByCourse:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

module.exports = {
  createSection,
  getSectionsByCourse,
};