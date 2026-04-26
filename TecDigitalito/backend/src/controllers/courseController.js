const Course = require('../models/Course');
const { driver } = require('../databases/neo4j');

const Section = require('../models/Section');
const SectionContent = require('../models/SectionContent');

function buildSectionTreeWithContent(sections, contents, parentId = null) {
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
      contents: contents
        .filter((content) => content.sectionId.toString() === section._id.toString())
        .sort((a, b) => a.order - b.order)
        .map((content) => ({
          _id: content._id,
          type: content.type,
          title: content.title,
          value: content.value,
          order: content.order,
        })),
      children: buildSectionTreeWithContent(sections, contents, section._id.toString()),
    }));
}

async function getCourseContentTree(req, res) {
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
    const sectionIds = sections.map((section) => section._id);
    const contents = await SectionContent.find({ sectionId: { $in: sectionIds } });

    const tree = buildSectionTreeWithContent(sections, contents);

    return res.status(200).json({
      ok: true,
      course: {
        _id: course._id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        description: course.description,
        startDate: course.startDate,
        endDate: course.endDate,
        imageUrl: course.imageUrl,
        published: course.published,
      },
      sections: tree,
    });
  } catch (error) {
    console.error('Error en getCourseContentTree:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}
async function createCourse(req, res) {
  const session = driver.session();

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

    // Crear nodos y relación en Neo4j
    await session.run(
      `
      MERGE (u:User {id: $userId})
      ON CREATE SET u.username = $username
      MERGE (c:Course {id: $courseId})
      SET c.courseCode = $courseCode,
          c.courseName = $courseName
      MERGE (u)-[:TEACHES]->(c)
      `,
      {
        userId: req.user.userId,
        username: req.user.username,
        courseId: course._id.toString(),
        courseCode: course.courseCode,
        courseName: course.courseName,
      }
    );

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
  } finally {
    await session.close();
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

async function enrollInCourse(req, res) {
  const session = driver.session();

  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        ok: false,
        message: 'Curso no encontrado',
      });
    }

    if (!course.published) {
      return res.status(400).json({
        ok: false,
        message: 'El curso no está publicado',
      });
    }

    if (course.teacherId && course.teacherId.toString() === req.user.userId) {
      return res.status(400).json({
        ok: false,
        message: 'No puedes matricularte en tu propio curso',
      });
    }

    await session.run(
      `
      MERGE (u:User {id: $userId})
      ON CREATE SET u.username = $username
      MERGE (c:Course {id: $courseId})
      SET c.courseCode = $courseCode,
          c.courseName = $courseName
      MERGE (u)-[:ENROLLED_IN]->(c)
      `,
      {
        userId: req.user.userId,
        username: req.user.username,
        courseId: course._id.toString(),
        courseCode: course.courseCode,
        courseName: course.courseName,
      }
    );

    return res.status(200).json({
      ok: true,
      message: 'Matrícula realizada correctamente',
    });
  } catch (error) {
    console.error('Error en enrollInCourse:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  } finally {
    await session.close();
  }
}

async function getMyEnrolledCourses(req, res) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})-[:ENROLLED_IN]->(c:Course)
      RETURN c.id AS courseId
      `,
      {
        userId: req.user.userId,
      }
    );

    const courseIds = result.records.map((record) => record.get('courseId'));

    const courses = await Course.find({
      _id: { $in: courseIds },
    });

    return res.status(200).json({
      ok: true,
      courses,
    });
  } catch (error) {
    console.error('Error en getMyEnrolledCourses:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  } finally {
    await session.close();
  }
}

async function getStudentsByCourse(req, res) {
  const session = driver.session();

  try {
    const { id } = req.params;

    const result = await session.run(
      `
      MATCH (u:User)-[:ENROLLED_IN]->(c:Course {id: $courseId})
      RETURN u.id AS userId, u.username AS username
      `,
      {
        courseId: id,
      }
    );

    const students = result.records.map((record) => ({
      userId: record.get('userId'),
      username: record.get('username'),
    }));

    return res.status(200).json({
      ok: true,
      students,
    });
  } catch (error) {
    console.error('Error en getStudentsByCourse:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  } finally {
    await session.close();
  }
}

module.exports = {
  createCourse,
  getMyCreatedCourses,
  getCatalog,
  publishCourse,
  enrollInCourse,
  getMyEnrolledCourses,
  getStudentsByCourse,
  getCourseContentTree,
};