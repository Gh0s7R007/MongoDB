const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    course_id: { type: String, required: true, unique: true },
    course_name: { type: String, required: true },
    course_code: { type: String, required: true, unique: true },
    credits: { type: Number, required: true },
    semester: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    enrolled_students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

module.exports = mongoose.model('Course', courseSchema);
