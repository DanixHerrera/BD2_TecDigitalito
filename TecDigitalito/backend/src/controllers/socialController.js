const User = require('../models/User');
const Course = require('../models/Course');
const { driver } = require('../databases/neo4j');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function sendFriendRequest(req, res) {
  const session = driver.session();

  try {
    const requesterId = req.user.userId;
    const { userId: targetUserId } = req.params;

    if (requesterId === targetUserId) {
      return res.status(400).json({
        ok: false,
        message: 'No puedes enviarte una solicitud a ti misma',
      });
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario destino no encontrado',
      });
    }

    await session.run(
      `
      MERGE (u1:User {id: $requesterId})
      ON CREATE SET u1.username = $requesterUsername
      MERGE (u2:User {id: $targetUserId})
      ON CREATE SET u2.username = $targetUsername
      MERGE (u1)-[r:REQUESTED_FRIEND]->(u2)
      RETURN r
      `,
      {
        requesterId,
        requesterUsername: req.user.username,
        targetUserId,
        targetUsername: targetUser.username,
      }
    );

    return res.status(200).json({
      ok: true,
      message: 'Solicitud de amistad enviada',
    });
  } catch (error) {
    console.error('Error en sendFriendRequest:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  } finally {
    await session.close();
  }
}

async function acceptFriendRequest(req, res) {
  const session = driver.session();

  try {
    const currentUserId = req.user.userId;
    const { userId: requesterId } = req.params;

    const result = await session.run(
      `
      MATCH (u1:User {id: $requesterId})-[r:REQUESTED_FRIEND]->(u2:User {id: $currentUserId})
      DELETE r
      MERGE (u1)-[:FRIEND]->(u2)
      MERGE (u2)-[:FRIEND]->(u1)
      RETURN u1, u2
      `,
      {
        requesterId,
        currentUserId,
      }
    );

    if (result.records.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Solicitud de amistad no encontrada',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Solicitud aceptada correctamente',
    });
  } catch (error) {
    console.error('Error en acceptFriendRequest:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  } finally {
    await session.close();
  }
}

async function listMyFriends(req, res) {
  const session = driver.session();

  try {
    const userId = req.user.userId;

    const result = await session.run(
      `
      MATCH (u:User {id: $userId})-[:FRIEND]->(f:User)
      RETURN f.id AS userId, f.username AS username
      `,
      { userId }
    );

    const friends = result.records.map((record) => ({
      userId: record.get('userId'),
      username: record.get('username'),
    }));

    return res.status(200).json({
      ok: true,
      friends,
    });
  } catch (error) {
    console.error('Error en listMyFriends:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  } finally {
    await session.close();
  }
}

async function getFriendCourses(req, res) {
  const session = driver.session();

  try {
    const currentUserId = req.user.userId;
    const { id: friendId } = req.params;

    const friendshipCheck = await session.run(
      `
      MATCH (u1:User {id: $currentUserId})-[:FRIEND]->(u2:User {id: $friendId})
      RETURN u2
      `,
      {
        currentUserId,
        friendId,
      }
    );

    if (friendshipCheck.records.length === 0) {
      return res.status(403).json({
        ok: false,
        message: 'No puedes ver los cursos de un usuario que no es tu amigo',
      });
    }

    const teachingResult = await session.run(
      `
      MATCH (u:User {id: $friendId})-[:TEACHES]->(c:Course)
      RETURN c.id AS courseId
      `,
      { friendId }
    );

    const enrolledResult = await session.run(
      `
      MATCH (u:User {id: $friendId})-[:ENROLLED_IN]->(c:Course)
      RETURN c.id AS courseId
      `,
      { friendId }
    );

    const teachingIds = teachingResult.records.map((r) => r.get('courseId'));
    const enrolledIds = enrolledResult.records.map((r) => r.get('courseId'));

    const allIds = [...new Set([...teachingIds, ...enrolledIds])];

    const courses = await Course.find({
      _id: { $in: allIds },
    });

    return res.status(200).json({
      ok: true,
      teachingCourseIds: teachingIds,
      enrolledCourseIds: enrolledIds,
      courses,
    });
  } catch (error) {
    console.error('Error en getFriendCourses:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  } finally {
    await session.close();
  }
}

async function getPendingRequests(req, res) {
  const session = driver.session();

  try {
    const userId = req.user.userId;
    const result = await session.run(
      `
      MATCH (requester:User)-[r:REQUESTED_FRIEND]->(me:User {id: $userId})
      RETURN requester.id AS requesterId, requester.username AS username, r.createdAt AS createdAt
      `,
      { userId }
    );

    const requests = result.records.map((record) => ({
      userId: record.get('requesterId'),
      username: record.get('username'),
      createdAt: record.get('createdAt'),
    }));

    if (requests.length > 0) {
      const ids = requests.map((request) => request.userId);
      const users = await User.find(
        { _id: { $in: ids } },
        'username email fullName avatarUrl'
      );

      const hydratedRequests = requests.map((request) => {
        const user = users.find((candidate) => candidate._id.toString() === request.userId);
        return { ...request, user };
      });

      return res.status(200).json({ ok: true, requests: hydratedRequests });
    }

    return res.status(200).json({ ok: true, requests: [] });
  } catch (error) {
    console.error('Error en getPendingRequests:', error);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  } finally {
    await session.close();
  }
}

async function rejectFriendRequest(req, res) {
  const session = driver.session();

  try {
    const currentUserId = req.user.userId;
    const { userId: requesterId } = req.params;

    const result = await session.run(
      `
      MATCH (u1:User {id: $requesterId})-[r:REQUESTED_FRIEND]->(u2:User {id: $currentUserId})
      DELETE r
      RETURN u1
      `,
      { requesterId, currentUserId }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ ok: false, message: 'Solicitud no encontrada' });
    }

    return res.status(200).json({ ok: true, message: 'Solicitud rechazada' });
  } catch (error) {
    console.error('Error en rejectFriendRequest:', error);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  } finally {
    await session.close();
  }
}

async function removeFriend(req, res) {
  const session = driver.session();

  try {
    const currentUserId = req.user.userId;
    const { id: friendId } = req.params;

    await session.run(
      `
      MATCH (u1:User {id: $currentUserId})-[r1:FRIEND]->(u2:User {id: $friendId})
      MATCH (u2)-[r2:FRIEND]->(u1)
      DELETE r1, r2
      `,
      { currentUserId, friendId }
    );

    return res.status(200).json({ ok: true, message: 'Amigo eliminado' });
  } catch (error) {
    console.error('Error en removeFriend:', error);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  } finally {
    await session.close();
  }
}

async function searchUsers(req, res) {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ ok: false, message: 'Usuario no identificado' });
    }

    // Validar si el ID es un ObjectId válido para evitar errores de casteo (400)
    const mongoose = require('mongoose');
    const isValidId = mongoose.Types.ObjectId.isValid(req.user.userId);
    
    const baseFilter = isValidId ? { _id: { $ne: req.user.userId } } : {};
    let users;

    if (!q) {
      users = await User.find(
        baseFilter,
        'username email fullName avatarUrl'
      )
        .sort({ lastLoginAt: -1, createdAt: -1 })
        .limit(20);
    } else {
      const regex = new RegExp(escapeRegex(q), 'i');
      const filter = {
        ...baseFilter,
        $or: [{ fullName: regex }, { email: regex }, { username: regex }],
      };

      users = await User.find(
        filter,
        'username email fullName avatarUrl'
      ).limit(20);
    }

    return res.status(200).json({ ok: true, users });
  } catch (error) {
    console.error('Error detallado en searchUsers:', error);
    return res.status(500).json({ ok: false, message: 'Error interno al buscar usuarios' });
  }
}

async function getStudentsByCourse(req, res) {
  const session = driver.session();

  try {
    const { courseId } = req.params;

    const result = await session.run(
      `
      MATCH (u:User)-[:ENROLLED_IN]->(c:Course {id: $courseId})
      RETURN u.id AS userId
      `,
      { courseId }
    );

    const studentIds = result.records.map((record) => record.get('userId'));

    if (studentIds.length === 0) {
      return res.status(200).json({ ok: true, students: [] });
    }

    const students = await User.find(
      { _id: { $in: studentIds } },
      'username email fullName avatarUrl'
    );

    return res.status(200).json({ ok: true, students });
  } catch (error) {
    console.error('Error en getStudentsByCourse:', error);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  } finally {
    await session.close();
  }
}

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  listMyFriends,
  getFriendCourses,
  getPendingRequests,
  rejectFriendRequest,
  removeFriend,
  searchUsers,
  getStudentsByCourse,
};
