const User = require('../models/User');
const Course = require('../models/Course');
const { driver } = require('../databases/neo4j');
const mongoose = require('mongoose');
const { getEnrolledStudentsForCourse } = require('../services/courseEnrollmentService');

class SocialRepository {
  static async sendFriendRequest(requesterId, requesterUsername, targetUserId, targetUsername) {
    const session = driver.session();
    try {
      await session.run(
        `
        MERGE (u1:User {id: $requesterId})
        ON CREATE SET u1.username = $requesterUsername
        MERGE (u2:User {id: $targetUserId})
        ON CREATE SET u2.username = $targetUsername
        MERGE (u1)-[r:REQUESTED_FRIEND]->(u2)
        ON CREATE SET r.createdAt = datetime()
        RETURN r
        `,
        { requesterId, requesterUsername, targetUserId, targetUsername }
      );

      await User.updateOne(
        { _id: targetUserId, 'pendingFriendRequests.user': { $ne: requesterId } },
        { $push: { pendingFriendRequests: { user: requesterId, createdAt: new Date() } } }
      );
    } finally {
      await session.close();
    }
  }

  static async acceptFriendRequest(requesterId, currentUserId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (u1:User {id: $requesterId})-[r:REQUESTED_FRIEND]->(u2:User {id: $currentUserId})
        DELETE r
        MERGE (u1)-[:FRIEND]->(u2)
        MERGE (u2)-[:FRIEND]->(u1)
        RETURN u1, u2
        `,
        { requesterId, currentUserId }
      );

      if (result.records.length === 0) return false;

      await User.updateOne(
        { _id: currentUserId },
        {
          $pull: { pendingFriendRequests: { user: requesterId } },
          $addToSet: { friends: requesterId },
        }
      );

      await User.updateOne(
        { _id: requesterId },
        { $addToSet: { friends: currentUserId } }
      );

      return true;
    } finally {
      await session.close();
    }
  }

  static async rejectFriendRequest(requesterId, currentUserId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (u1:User {id: $requesterId})-[r:REQUESTED_FRIEND]->(u2:User {id: $currentUserId})
        DELETE r
        RETURN u1
        `,
        { requesterId, currentUserId }
      );

      if (result.records.length === 0) return false;

      await User.updateOne(
        { _id: currentUserId },
        { $pull: { pendingFriendRequests: { user: requesterId } } }
      );

      return true;
    } finally {
      await session.close();
    }
  }

  static async removeFriend(friendId, currentUserId) {
    const session = driver.session();
    try {
      await session.run(
        `
        MATCH (u1:User {id: $currentUserId})-[r1:FRIEND]->(u2:User {id: $friendId})
        MATCH (u2)-[r2:FRIEND]->(u1)
        DELETE r1, r2
        `,
        { currentUserId, friendId }
      );

      await User.updateOne(
        { _id: currentUserId },
        { $pull: { friends: friendId } }
      );

      await User.updateOne(
        { _id: friendId },
        { $pull: { friends: currentUserId } }
      );
    } finally {
      await session.close();
    }
  }

  static async getFriendCourses(friendId, currentUserId) {
    const session = driver.session();
    try {
      const friendshipCheck = await session.run(
        `MATCH (u1:User {id: $currentUserId})-[:FRIEND]->(u2:User {id: $friendId}) RETURN u2`,
        { currentUserId, friendId }
      );

      if (friendshipCheck.records.length === 0) return null;

      const [teachingCourses, enrolledCourses] = await Promise.all([
        Course.find({ teacherId: friendId }).lean(),
        Course.find({ enrolledStudents: friendId }).lean(),
      ]);

      const teachingIds = teachingCourses.map((course) => course._id.toString());
      const enrolledIds = enrolledCourses.map((course) => course._id.toString());
      const coursesById = new Map();

      [...teachingCourses, ...enrolledCourses].forEach((course) => {
        coursesById.set(course._id.toString(), course);
      });

      const courses = Array.from(coursesById.values());

      return { teachingIds, enrolledIds, courses };
    } finally {
      await session.close();
    }
  }

  static async getStudentsByCourse(courseId) {
    return await getEnrolledStudentsForCourse(courseId);
  }

  static escapeRegex(value) {
    return value.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&');
  }

  static async searchUsers(q, currentUserId) {
    const isValidId = mongoose.Types.ObjectId.isValid(currentUserId);
    const baseFilter = isValidId ? { _id: { $ne: currentUserId } } : {};

    if (!q) {
      return await User.find(baseFilter, 'username email fullName avatarUrl')
        .sort({ lastLoginAt: -1, createdAt: -1 })
        .limit(20);
    } else {
      const regex = new RegExp(this.escapeRegex(q), 'i');
      return await User.find(
        { ...baseFilter, $or: [{ fullName: regex }, { email: regex }, { username: regex }] },
        'username email fullName avatarUrl'
      ).limit(20);
    }
  }
}

module.exports = SocialRepository;
