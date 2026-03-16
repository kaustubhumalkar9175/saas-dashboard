const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  taskId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  projectId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl:    { type: String, required: true },
  fileName:   { type: String, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('File', fileSchema);