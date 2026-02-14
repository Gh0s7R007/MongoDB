const Course = require('../models/Course');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// ... (keep getAllUsers functions)

// Helper for auto-generating credentials
const generateCredentials = (name, type, roleIdPrefix) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '.');
    // Random 3 digit number for uniqueness
    const email = `${cleanName}@${type === 'student' ? 'student.univ.ma' : 'univ.ma'}`;
    const password = 'password123';
    // ID: (Prefix)(Year)(Random)
    const id = `${roleIdPrefix}${new Date().getFullYear()}${Math.floor(Math.random() * 1000)}`;
    return { email, password, id };
};

// @desc    Create a new Student
// @route   POST /api/admin/students
const createStudent = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    try {
        const { email, password, id } = generateCredentials(name, 'student', 'S');
        
        const student = await Student.create({
            student_id: id,
            name,
            email,
            password,
            academic_year: '2025-2026'
        });

        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new Teacher
// @route   POST /api/admin/teachers
const createTeacher = async (req, res) => {
    const { name, department } = req.body;
    if (!name || !department) return res.status(400).json({ message: 'Name and Department are required' });

    try {
        const { email, password, id } = generateCredentials(name, 'teacher', 'T');
        
        const teacher = await Teacher.create({
            teacher_id: id,
            name,
            email,
            password,
            department
        });

        res.status(201).json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new Course
// @route   POST /api/admin/courses
const createCourse = async (req, res) => {
    const { course_name, course_code, credits, semester, teacherId } = req.body;
    
    try {
        // Auto-generate course ID if not provided, or use code
        const course_id = `C${Math.floor(Math.random() * 10000)}`;

        const course = await Course.create({
            course_id,
            course_name,
            course_code,
            credits,
            semester,
            teacher: teacherId
        });

        // Assign to teacher
        if (teacherId) {
            await Teacher.findByIdAndUpdate(teacherId, { $push: { assigned_courses: course._id } });
        }

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Enroll Student in Course
// @route   POST /api/admin/enroll
const enrollStudent = async (req, res) => {
    const { studentId, courseId } = req.body;

    try {
        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);

        if (!student || !course) return res.status(404).json({ message: 'Student or Course not found' });

        // Check if already enrolled
        if (student.enrolled_courses.some(id => id.toString() === courseId)) {
            return res.status(400).json({ message: 'Student already enrolled' });
        }

        student.enrolled_courses.push(courseId);
        await student.save();

        course.enrolled_students.push(studentId);
        await course.save();

        res.json({ message: 'Enrollment successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/admin/students
// @access  Private (Admin)
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all teachers
// @route   GET /api/admin/teachers
// @access  Private (Admin)
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find().select('-password');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:type/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    const { type, id } = req.params;
    try {
        if (type === 'student') {
            await Student.findByIdAndDelete(id);
        } else if (type === 'teacher') {
            await Teacher.findByIdAndDelete(id);
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get students enrolled in a course
// @route   GET /api/admin/courses/:id/students
const getCourseEnrolledStudents = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('enrolled_students', '-password');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course.enrolled_students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getAllStudents, 
    getAllTeachers, 
    deleteUser,
    createStudent,
    createTeacher,
    createCourse,
    enrollStudent,
    getCourseEnrolledStudents
};