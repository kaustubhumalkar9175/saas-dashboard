const ActivityLog = require('../models/ActivityLog');

// GET /api/activity
// Get logged-in user's activity
exports.getMyActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const logs = await ActivityLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email');

    res.json({ count: logs.length, logs });
  } catch (err) {
    console.error('GET ACTIVITY ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/activity/all  (admin only)
exports.getAllActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email');

    res.json({ count: logs.length, logs });
  } catch (err) {
    console.error('GET ALL ACTIVITY ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};