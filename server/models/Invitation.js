const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  email:  { type: String, required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  role:   { type: String, enum: ['admin','member'], default: 'member' },
  status: { type: String, enum: ['pending','accepted'], default: 'pending' }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Invitation', invitationSchema);