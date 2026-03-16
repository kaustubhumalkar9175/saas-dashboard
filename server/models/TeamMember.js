const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  teamId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role:     { type: String, enum: ['admin','member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);