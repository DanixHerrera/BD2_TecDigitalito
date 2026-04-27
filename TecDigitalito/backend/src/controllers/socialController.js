const User = require('../models/User');
const SocialRepository = require('../repositories/SocialRepository');

const sendFriendRequest = async (req, res) => {
  const requesterId = req.user.userId;
  const { userId: targetUserId } = req.params;

  if (requesterId === targetUserId) {
    return res.error('No puedes enviarte una solicitud a ti misma');
  }

  const [requesterUser, targetUser] = await Promise.all([
    User.findById(requesterId),
    User.findById(targetUserId),
  ]);

  if (!targetUser) return res.errorNotFound('Usuario destino no encontrado');
  if (!requesterUser) return res.errorNotFound('Usuario solicitante no encontrado');

  if ((requesterUser.friends || []).some((friendId) => friendId.toString() === targetUserId)) {
    return res.success(null, 'Ya son amigos');
  }

  await SocialRepository.sendFriendRequest(requesterId, req.user.username, targetUserId, targetUser.username);

  return res.success(null, 'Solicitud de amistad enviada');
};

const acceptFriendRequest = async (req, res) => {
  const currentUserId = req.user.userId;
  const { userId: requesterId } = req.params;

  const success = await SocialRepository.acceptFriendRequest(requesterId, currentUserId);

  if (!success) {
    return res.errorNotFound('Solicitud de amistad no encontrada');
  }

  return res.success(null, 'Solicitud aceptada correctamente');
};

const listMyFriends = async (req, res) => {
  const userId = req.user.userId;
  const currentUser = await User.findById(userId)
    .populate('friends', 'username email fullName avatarUrl')
    .lean();

  if (!currentUser) return res.errorNotFound('Usuario no encontrado');

  const friends = (currentUser.friends || []).map((friend) => ({
    userId: friend._id.toString(),
    username: friend.username,
    email: friend.email,
    fullName: friend.fullName,
    avatarUrl: friend.avatarUrl || '',
  }));

  return res.success({ friends });
};

const getFriendCourses = async (req, res) => {
  const currentUserId = req.user.userId;
  const { id: friendId } = req.params;

  const data = await SocialRepository.getFriendCourses(friendId, currentUserId);

  if (!data) {
    return res.error('No puedes ver los cursos de un usuario que no es tu amigo', 403);
  }

  return res.success({
    teachingCourseIds: data.teachingIds,
    enrolledCourseIds: data.enrolledIds,
    courses: data.courses,
  });
};

const getPendingRequests = async (req, res) => {
  const userId = req.user.userId;
  const currentUser = await User.findById(userId)
    .populate('pendingFriendRequests.user', 'username email fullName avatarUrl')
    .lean();

  if (!currentUser) return res.errorNotFound('Usuario no encontrado');

  const requests = (currentUser.pendingFriendRequests || [])
    .filter((request) => request.user)
    .map((request) => ({
      userId: request.user._id.toString(),
      username: request.user.username,
      createdAt: request.createdAt || null,
      user: {
        _id: request.user._id.toString(),
        username: request.user.username,
        email: request.user.email,
        fullName: request.user.fullName,
        avatarUrl: request.user.avatarUrl || '',
      },
    }));

  return res.success({ requests });
};

const rejectFriendRequest = async (req, res) => {
  const currentUserId = req.user.userId;
  const { userId: requesterId } = req.params;

  const success = await SocialRepository.rejectFriendRequest(requesterId, currentUserId);

  if (!success) return res.errorNotFound('Solicitud no encontrada');

  return res.success(null, 'Solicitud rechazada');
};

const removeFriend = async (req, res) => {
  const currentUserId = req.user.userId;
  const { id: friendId } = req.params;

  await SocialRepository.removeFriend(friendId, currentUserId);

  return res.success(null, 'Amigo eliminado');
};

const searchUsers = async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  if (!req.user || !req.user.userId) {
    return res.error('Usuario no identificado', 401);
  }

  const users = await SocialRepository.searchUsers(q, req.user.userId);

  return res.success({ users });
};

const getStudentsByCourse = async (req, res) => {
  const { courseId } = req.params;
  const students = await SocialRepository.getStudentsByCourse(courseId);

  return res.success({ students });
};

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
