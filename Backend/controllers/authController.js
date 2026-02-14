const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password, role } = req.body;

    if (!role) {
        return res.status(400).json({ message: 'Please specify role (student or teacher)' });
    }

    try {
        let user;
        if (role === 'student') {
            user = await Student.findOne({ email });
        } else if (role === 'teacher') {
            user = await Teacher.findOne({ email });
        } else if (role === 'admin') {
            user = await Admin.findOne({ email });
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: role,
                token: generateToken(user._id, role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new student
// @route   POST /api/auth/register/student
// @access  Public
const registerStudent = async (req, res) => {
    const { student_id, name, email, password, academic_year } = req.body;

    try {
        const userExists = await Student.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const student = await Student.create({
            student_id,
            name,
            email,
            password,
            academic_year
        });

        if (student) {
            res.status(201).json({
                _id: student._id,
                name: student.name,
                email: student.email,
                role: 'student',
                token: generateToken(student._id, 'student'),
            });
        } else {
            res.status(400).json({ message: 'Invalid student data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new teacher
// @route   POST /api/auth/register/teacher
// @access  Public
const registerTeacher = async (req, res) => {
    const { teacher_id, name, email, password, department } = req.body;

    try {
        const userExists = await Teacher.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const teacher = await Teacher.create({
            teacher_id,
            name,
            email,
            password,
            department
        });

        if (teacher) {
            res.status(201).json({
                _id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                role: 'teacher',
                token: generateToken(teacher._id, 'teacher'),
            });
        } else {
            res.status(400).json({ message: 'Invalid teacher data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    let user;
    if (req.user.role === 'student') user = await Student.findById(req.user.id);
    else if (req.user.role === 'teacher') user = await Teacher.findById(req.user.id);
    else if (req.user.role === 'admin') user = await Admin.findById(req.user.id);

    if (user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: req.user.role // appended by middleware
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
}

module.exports = { loginUser, registerStudent, registerTeacher, getMe };
