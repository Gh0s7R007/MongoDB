const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Grade = require('../models/Grade');
const Student = require('../models/Student');
const mongoose = require('mongoose');

const getTeacherCourses = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id).populate('assigned_courses');
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(teacher.assigned_courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addGrade = async (req, res) => {
    const { studentId, assignmentType, score, maxScore } = req.body;
    const courseId = req.params.id;
    const teacherId = req.user.id;

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        
        const grade = await Grade.create({
            grade_id: `G${Date.now()}`,
            student: studentId,
            course: courseId,
            assignment_type: assignmentType,
            score,
            max_score: maxScore || 20,
            percentage: ((score / (maxScore || 20)) * 100),
            graded_by: teacherId
        });

        res.status(201).json(grade);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCourseStudents = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('enrolled_students', 'student_id name email');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course.enrolled_students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCourseStatistics = async (req, res) => {
    try {
        const courseId = new mongoose.Types.ObjectId(req.params.id);

        const stats = await Grade.aggregate([
            { $match: { course: courseId } },
            {
                $group: {
                    _id: null,
                    averageScore: { $avg: '$score' },
                    highestScore: { $max: '$score' },
                    lowestScore: { $min: '$score' },
                    totalGrades: { $sum: 1 }
                }
            }
        ]);

        const assignmentStats = await Grade.aggregate([
            { $match: { course: courseId } },
            {
                $group: {
                    _id: '$assignment_type',
                    average: { $avg: '$score' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const studentPerformance = await Grade.aggregate([
            { $match: { course: courseId } },
            {
                $group: {
                    _id: '$student', // Student ID
                    avgScore: { $avg: '$score' }
                }
            },
            { $sort: { avgScore: -1 } },
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            { $unwind: '$studentInfo' },
            {
                $project: {
                    name: '$studentInfo.name',
                    avgScore: 1
                }
            }
        ]);

        res.json({
            overall: stats[0] || {},
            byAssignment: assignmentStats,
            studentRanking: studentPerformance
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTeacherCourses, addGrade, getCourseStudents, getCourseStatistics };
