const User = require('../models/User');

async function searchUsers(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.json({ ok: true, users: [] });
  }

  const users = await User.find({
    username: { $regex: q, $options: 'i' },
  }).select('_id username fullName');

  res.json({ ok: true, users });
}

module.exports = {
  searchUsers,
};