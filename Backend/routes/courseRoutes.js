const express = require('express');
const router = express.Router();
const { addGrade, getCourseStudents, getCourseStatistics } = require('../controllers/teacherController');
const { protect, teacherOnly } = require('../middlewares/authMiddleware');
const Course = require('../models/Course');

// General list courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('teacher', 'name');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single course details
router.get('/:id', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('teacher', 'name email');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Teacher specific routes for a course
router.post('/:id/grades', protect, teacherOnly, addGrade);
router.get('/:id/students', protect, teacherOnly, getCourseStudents); // Or student access?
router.get('/:id/statistics', protect, getCourseStatistics); // Maybe allow students to see class stats?

module.exports = router;
