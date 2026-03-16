const express = require('express');
const router  = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/profile',         getProfile);
router.put('/profile',         updateProfile);
router.put('/change-password', changePassword);

// Admin only routes
router.get('/',        adminOnly, getAllUsers);
router.delete('/:id',  adminOnly, deleteUser);

module.exports = router;