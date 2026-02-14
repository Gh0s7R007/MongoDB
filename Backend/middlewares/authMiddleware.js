const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if user is student or teacher
            // Optimistically check role if included in token, otherwise define priority or check both
            // The token I generate HAS role.
            
            req.user = decoded; // { id, role, iat, exp }
            
            // Optionally fetch full user object if needed, but for performance we might skip unless required.
            // For now, let's trusting the JWT content is usually enough for id/role, 
            // but if we want to ensure user still exists:
            
            if (req.user.role === 'student') {
                 const student = await Student.findById(decoded.id).select('-password');
                 if(!student) throw new Error('Not authorized, student not found');
                 req.user = { ...decoded, ...student._doc, role: 'student' }; // Merge
            } else if (req.user.role === 'teacher') {
                 const teacher = await Teacher.findById(decoded.id).select('-password');
                 if(!teacher) throw new Error('Not authorized, teacher not found');
                 req.user = { ...decoded, ...teacher._doc, role: 'teacher' };
            } else if (req.user.role === 'admin') {
                 // No extra fields needed
                 req.user = { ...decoded, role: 'admin' };
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const studentOnly = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a student' });
    }
};

const teacherOnly = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a teacher' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, studentOnly, teacherOnly, adminOnly };
