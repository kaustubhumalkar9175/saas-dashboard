const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Team', teamSchema);