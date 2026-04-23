/*
const Course = require('../models/Course');
const { driver } = require('../databases/neo4j');

// Obtener cursos donde el usuario está matriculado (Híbrido Neo4j + MongoDB)
exports.getMyEnrolledCourses = async (req, res) => {
  const session = driver.session();
  try {
    const userId = req.user.id;

    // 1. Consultar IDs en Neo4j
    const result = await session.run(
      'MATCH (u:Usuario {id: $uid})-[:MATRICULADO_EN]->(c:Curso) RETURN c.id AS id',
      { uid: userId }
    );
    const ids = result.records.map(record => record.get('id'));

    // 2. Hidratar con datos de MongoDB
    const courses = await Course.find({ course_id: { $in: ids } });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await session.close();
  }
};

// Obtener cursos impartidos por el usuario (Consulta Directa MongoDB)
exports.getTeachingCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    // Buscamos en la vista materializada view_professor_team dentro del documento del curso
    const courses = await Course.find({ 
      "view_professor_team.professor_user_id": userId 
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener catalogo global de cursos (MongoDB)
exports.getCatalog = async (req, res) => {
  try {
    const courses = await Course.find({ status: 'active' });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
*/
