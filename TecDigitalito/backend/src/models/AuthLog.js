const mongoose = require('mongoose');

const authLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  action: {
    type: String,
    enum: ['login_success', 'login_failed', 'logout'],
    required: true,
  },
  ip: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuthLog', authLogSchema);