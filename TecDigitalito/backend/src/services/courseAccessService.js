const { getEnrolledStudentIds } = require('./courseEnrollmentService');

async function getCourseAccess(course, userId) {
  // Handle both populated and unpopulated teacherId
  const teacherId = course.teacherId?._id || course.teacherId;
  const isTeacher = teacherId?.toString() === userId;

  const enrolledStudentIds = isTeacher
    ? []
    : await getEnrolledStudentIds(course._id, course.enrolledStudents);
  const isEnrolled = isTeacher ? false : enrolledStudentIds.includes(userId);

  return {
    isTeacher,
    isEnrolled,
    canEditCourse: isTeacher,
    canManageContent: isTeacher,
    canCreateEvaluations: isTeacher,
    canSubmitEvaluations: isEnrolled,
    canViewOwnResults: isEnrolled,
    canViewCourse: isTeacher || isEnrolled,
  };
}

module.exports = {
  getCourseAccess,
};
