const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updatePassword
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Validation rules
const userValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('name').notEmpty().withMessage('Name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'teacher', 'student', 'lab_manager', 'dean', 'ict', 'asset', 'lab_assistant'])
    .withMessage('Invalid role')
];

// TEMPORARY: Allow public access for testing
// Remove this in production!
router.post('/', userValidation, createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Protected routes (require authentication for sensitive operations)
router.use(protect);
router.use(authorize('admin'));

router.put('/:id', updateValidation, updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/password', updatePassword);

module.exports = router;