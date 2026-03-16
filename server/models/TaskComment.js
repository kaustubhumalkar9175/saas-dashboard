const mongoose = require('mongoose');

const taskCommentSchema = new mongoose.Schema({
  taskId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('TaskComment', taskCommentSchema);