const Course = require('../models/Course');
const User = require('../models/User');

async function getEnrolledStudentIds(courseId, enrolledStudents = []) {
  if (Array.isArray(enrolledStudents) && enrolledStudents.length > 0) {
    return enrolledStudents.map((studentId) => studentId.toString());
  }

  if (!courseId) {
    return [];
  }

  const course = await Course.findById(courseId, { enrolledStudents: 1 }).lean();
  if (!course?.enrolledStudents?.length) {
    return [];
  }

  return course.enrolledStudents.map((studentId) => studentId.toString());
}

async function getEnrolledStudentsForCourse(courseOrCourseId) {
  const course =
    typeof courseOrCourseId === 'object' && courseOrCourseId !== null
      ? courseOrCourseId
      : await Course.findById(courseOrCourseId);

  if (!course) {
    return [];
  }

  const studentIds = await getEnrolledStudentIds(course._id, course.enrolledStudents);
  if (studentIds.length === 0) {
    return [];
  }

  const users = await User.find(
    { _id: { $in: studentIds } },
    'username email fullName avatarUrl'
  ).lean();

  return users.map((user) => ({
    id: user._id.toString(),
    userId: user._id.toString(),
    username: user.username,
    fullName: user.fullName || user.username,
    email: user.email,
    avatarUrl: user.avatarUrl || '',
  }));
}

module.exports = {
  getEnrolledStudentIds,
  getEnrolledStudentsForCourse,
};
