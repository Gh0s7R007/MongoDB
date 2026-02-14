const express = require('express');
const router = express.Router();
const { getTeacherCourses } = require('../controllers/teacherController');
const { protect, teacherOnly } = require('../middlewares/authMiddleware');

router.get('/:id/courses', protect, teacherOnly, getTeacherCourses);

module.exports = router;
