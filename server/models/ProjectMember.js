const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role:      { type: String, enum: ['owner','member'], default: 'member' }
});

module.exports = mongoose.model('ProjectMember', projectMemberSchema);