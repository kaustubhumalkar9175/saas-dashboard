const express = require('express');
const router  = express.Router();
const {
  getMyActivity,
  getAllActivity,
} = require('../controllers/activityController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/',    getMyActivity);
router.get('/all', adminOnly, getAllActivity);

module.exports = router;