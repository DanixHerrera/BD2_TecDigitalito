const Course = require('../models/Course');
const Section = require('../models/Section');
const SectionContent = require('../models/SectionContent');
const { driver } = require('../databases/neo4j');
const {
  getEnrolledStudentIds,
  getEnrolledStudentsForCourse,
} = require('../services/courseEnrollmentService');
const { getCourseAccess } = require('../services/courseAccessService');

async function getEnrolledCourseIdsForUser(userId) {
  const mongoCourses = await Course.find({ enrolledStudents: userId }, { _id: 1 }).lean();
  return mongoCourses.map((course) => course._id.toString());
}

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

const getCourseContentTree = async (req, res) => {
  const { id: courseId } = req.params;

  const course = await Course.findById(courseId).populate(
    'teacherId',
    'username email fullName avatarUrl'
  );

  if (!course) {
    return res.errorNotFound('Curso no encontrado');
  }

  const sections = await Section.find({ courseId });
  const sectionIds = sections.map((section) => section._id);
  const contents = await SectionContent.find({ sectionId: { $in: sectionIds } });
  const tree = buildSectionTreeWithContent(sections, contents);

  const enrolledStudents = await getEnrolledStudentsForCourse(course);
  const permissions = req.user ? await getCourseAccess(course, req.user.userId) : null;

  if (permissions && !permissions.canViewCourse) {
    return res.error('No tienes acceso a este curso', 403);
  }

  const responsePayload = {
    course: {
      _id: course._id,
      courseCode: course.courseCode,
      courseName: course.courseName,
      description: course.description,
      startDate: course.startDate,
      endDate: course.endDate,
      imageUrl: course.imageUrl,
      published: course.published,
      professor: course.teacherId
        ? {
          id: course.teacherId._id,
          name: course.teacherId.fullName || course.teacherId.username,
          email: course.teacherId.email,
          avatarUrl: course.teacherId.avatarUrl,
        }
        : null,
      permissions,
      enrolledStudents: enrolledStudents.map((student) => ({
        id: student.id,
        userId: student.userId,
        username: student.username,
        fullName: student.fullName,
        email: student.email,
        avatarUrl: student.avatarUrl,
      })),
    },
    sections: tree
  };

  return res.success(responsePayload);
};

const syncContentTree = async (req, res) => {
  const { id: courseId } = req.params;
  const { tree } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.errorNotFound('Curso no encontrado');
    }

    if (course.teacherId.toString() !== req.user.userId) {
      return res.error('No tienes permiso para modificar este curso', 403);
    }

    // Eliminate all existing sections and section contents for this course
    const sections = await Section.find({ courseId });
    const sectionIds = sections.map((s) => s._id);
    await SectionContent.deleteMany({ sectionId: { $in: sectionIds } });
    await Section.deleteMany({ courseId });

    // Helper function to recursively save the tree
    let orderCounter = 0;
    const saveNode = async (node, parentSectionId = null) => {
      const section = await Section.create({
        courseId,
        parentSectionId,
        title: node.title || 'Nueva Sección',
        description: '',
        order: orderCounter++,
      });

      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          await saveNode(child, section._id);
        }
      }

      if (node.blocks && node.blocks.length > 0) {
        let blockOrder = 0;
        for (const block of node.blocks) {
          let backendType = block.type;
          if (backendType === 'file') backendType = 'document'; // Map frontend 'file' to backend 'document'
          
          let value = '';
          let title = '';

          if (block.type === 'text') {
            value = block.content || ' '; // require value
          } else if (block.type === 'file' || block.type === 'image') {
            value = block.url || '#';
            title = block.name || '';
          }

          if (!['text', 'video', 'image', 'document'].includes(backendType)) {
            backendType = 'text'; // Fallback
          }

          await SectionContent.create({
            sectionId: section._id,
            type: backendType,
            title,
            value: value || ' ',
            order: blockOrder++,
          });
        }
      }
    };

    if (tree && Array.isArray(tree)) {
      for (const node of tree) {
        await saveNode(node);
      }
    }

    return res.success({}, 'Árbol de contenido guardado correctamente');
  } catch (error) {
    console.error('Error en syncContentTree:', error);
    return res.error('Error interno al guardar el contenido', 500);
  }
};

const createCourse = async (req, res) => {
  const { courseCode, courseName, description, startDate, endDate, imageUrl } = req.body;

  if (!courseCode || !courseName || !description || !startDate) {
    return res.error('courseCode, courseName, description y startDate son requeridos');
  }

  const normalizedCode = courseCode.trim();
  const existingCourse = await Course.findOne({ courseCode: normalizedCode });
  if (existingCourse) {
    return res.error('Ya existe un curso con ese codigo', 409);
  }

  const course = await Course.create({
    courseCode: normalizedCode,
    courseName: courseName.trim(),
    description: description.trim(),
    startDate,
    endDate: endDate || null,
    imageUrl: imageUrl?.trim() || '',
    teacherId: req.user.userId,
    published: false,
  });

  const session = driver.session();
  try {
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
  } finally {
    await session.close();
  }

  return res.success({ course }, 'Curso creado correctamente', 201);
};

const getMyCreatedCourses = async (req, res) => {
  const courses = await Course.find({ teacherId: req.user.userId }).sort({ createdAt: -1 });
  return res.success({ courses });
};

const getCatalog = async (req, res) => {
  const courses = await Course.find({ published: true }).sort({ createdAt: -1 });
  return res.success({ courses });
};

const publishCourse = async (req, res) => {
  const { id } = req.params;

  const course = await Course.findOne({ _id: id, teacherId: req.user.userId });
  if (!course) {
    return res.errorNotFound('Curso no encontrado o no pertenece al usuario');
  }

  course.published = true;
  await course.save();

  return res.success({ course }, 'Curso publicado correctamente');
};

const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { courseCode, courseName, description, startDate, endDate, imageUrl } = req.body;

  const course = await Course.findOne({ _id: id, teacherId: req.user.userId });
  if (!course) {
    return res.errorNotFound('Curso no encontrado o no pertenece al usuario');
  }

  if (!courseCode || !courseName || !description || !startDate) {
    return res.error('courseCode, courseName, description y startDate son requeridos');
  }

  const normalizedCode = courseCode.trim();
  const existingCourse = await Course.findOne({ _id: { $ne: id }, courseCode: normalizedCode });
  if (existingCourse) {
    return res.error('Ya existe un curso con ese codigo', 409);
  }

  course.courseCode = normalizedCode;
  course.courseName = courseName.trim();
  course.description = description.trim();
  course.startDate = startDate;
  course.endDate = endDate || null;
  course.imageUrl = imageUrl?.trim() || '';
  await course.save();

  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (c:Course {id: $courseId})
      SET c.courseCode = $courseCode,
          c.courseName = $courseName
      `,
      {
        courseId: course._id.toString(),
        courseCode: course.courseCode,
        courseName: course.courseName,
      }
    );
  } finally {
    await session.close();
  }

  return res.success({ course }, 'Curso actualizado correctamente');
};

const enrollInCourse = async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id);
  if (!course) {
    return res.errorNotFound('Curso no encontrado');
  }

  if (!course.published) {
    return res.error('El curso no esta publicado');
  }

  if (course.teacherId && course.teacherId.toString() === req.user.userId) {
    return res.error('No puedes matricularte en tu propio curso');
  }

  const existingStudentIds = await getEnrolledStudentIds(course._id, course.enrolledStudents);
  if (existingStudentIds.includes(req.user.userId)) {
    return res.error('Ya estas matriculado en este curso', 409);
  }

  course.enrolledStudents = course.enrolledStudents || [];
  course.enrolledStudents.push(req.user.userId);
  await course.save();

  return res.success(
    {
      courseId: course._id.toString(),
      enrolledStudentsCount: (course.enrolledStudents || []).length,
    },
    'Matricula realizada correctamente'
  );
};

const getMyEnrolledCourses = async (req, res) => {
  const courseIds = await getEnrolledCourseIdsForUser(req.user.userId);
  const courses = await Course.find({ _id: { $in: courseIds } }).sort({ createdAt: -1 });
  return res.success({ courses });
};

const getStudentsByCourse = async (req, res) => {
  const { id: courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    return res.errorNotFound('Curso no encontrado');
  }

  const students = await getEnrolledStudentsForCourse(course);
  return res.success({ students });
};

module.exports = {
  createCourse,
  getMyCreatedCourses,
  getCatalog,
  publishCourse,
  updateCourse,
  enrollInCourse,
  getMyEnrolledCourses,
  getStudentsByCourse,
  getCourseContentTree,
  syncContentTree,
};
