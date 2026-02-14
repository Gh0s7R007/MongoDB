const express = require('express');
const router = express.Router();
const { 
    getAllStudents, 
    getAllTeachers, 
    deleteUser,
    createStudent,
    createTeacher,
    createCourse,
    enrollStudent,
    getCourseEnrolledStudents
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/students', protect, adminOnly, getAllStudents);
router.get('/teachers', protect, adminOnly, getAllTeachers);
router.delete('/users/:type/:id', protect, adminOnly, deleteUser);

router.post('/students', protect, adminOnly, createStudent);
router.post('/teachers', protect, adminOnly, createTeacher);
router.post('/courses', protect, adminOnly, createCourse);
router.post('/enroll', protect, adminOnly, enrollStudent);
router.get('/courses/:id/students', protect, adminOnly, getCourseEnrolledStudents);

module.exports = router;
