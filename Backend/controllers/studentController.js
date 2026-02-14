const Student = require('../models/Student');
const Course = require('../models/Course');
const Grade = require('../models/Grade');
const mongoose = require('mongoose');

// @desc    Get all grades for a student
// @route   GET /api/students/:id/grades
// @access  Private (Student/Teacher)
const getStudentGrades = async (req, res) => {
    try {
        const grades = await Grade.find({ student: req.params.id })
            .populate('course', 'course_name course_code credits')
            .populate('graded_by', 'name');
            
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get enrolled courses
// @route   GET /api/students/:id/courses
// @access  Private
const getStudentCourses = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate({
                path: 'enrolled_courses',
                populate: { path: 'teacher', select: 'name' }
            });
            
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json(student.enrolled_courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get academic statistics
// @route   GET /api/students/:id/statistics
// @access  Private
const getStudentStatistics = async (req, res) => {
    try {
        const studentId = new mongoose.Types.ObjectId(req.params.id); // Valid ObjectId

        const stats = await Grade.aggregate([
            { $match: { student: studentId } },
            {
                $group: {
                    _id: null,
                    totalGrades: { $sum: 1 },
                    averageScore: { $avg: '$score' },
                    highestScore: { $max: '$score' },
                    lowestScore: { $min: '$score' }
                }
            }
        ]);

        const coursePerformance = await Grade.aggregate([
            { $match: { student: studentId } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            { $unwind: '$courseInfo' },
            {
                $group: {
                    _id: '$courseInfo.course_name',
                    average: { $avg: '$score' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const assignmentTypePerformance = await Grade.aggregate([
            { $match: { student: studentId } },
            {
                $group: {
                    _id: '$assignment_type',
                    average: { $avg: '$score' }
                }
            }
        ]);

        res.json({
            overall: stats[0] || {},
            byCourse: coursePerformance,
            byAssignmentType: assignmentTypePerformance
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStudentGrades, getStudentCourses, getStudentStatistics };
