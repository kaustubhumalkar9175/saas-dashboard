const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status:      {
      type:    String,
      enum:    ['active', 'completed', 'on_hold'],
      default: 'active',
    },
    startDate: { type: Date },
    endDate:   { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);