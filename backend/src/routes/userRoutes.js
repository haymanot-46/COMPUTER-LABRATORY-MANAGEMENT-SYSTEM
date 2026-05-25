const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/userController');

router.get('/', ctrl.getUsers);
router.get('/roles', ctrl.getUserRoles);
router.get('/:id', ctrl.getUserById);
router.post('/', protect, authorize('admin'), ctrl.createUser);
router.put('/:id', ctrl.updateUser);
router.delete('/:id', ctrl.deleteUser);
router.post('/profile-image', protect, ctrl.uploadProfileImage);
router.get('/:id/profile-image', protect, ctrl.getProfileImage);
router.delete('/profile-image', protect, ctrl.deleteProfileImage);

module.exports = router;
