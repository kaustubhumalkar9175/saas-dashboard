const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ userId, action, entityType, entityId, description }) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      entityType,
      entityId,
      description,
    });
  } catch (err) {
    console.error('ACTIVITY LOG ERROR:', err.message);
  }
};

module.exports = logActivity;