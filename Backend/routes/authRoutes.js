const express = require('express');
const router = express.Router();
const { loginUser, registerStudent, registerTeacher, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/login', loginUser);
router.post('/register/student', registerStudent);
router.post('/register/teacher', registerTeacher);
router.get('/me', protect, getMe);

module.exports = router;
