const express = require('express');
const router = express.Router();
const { getStudentGrades, getStudentCourses, getStudentStatistics } = require('../controllers/studentController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/:id/grades', protect, getStudentGrades);
router.get('/:id/courses', protect, getStudentCourses);
router.get('/:id/statistics', protect, getStudentStatistics);

module.exports = router;
