const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    grade_id: { type: String, required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    assignment_type: { 
        type: String, 
        required: true,
        enum: ['Exam', 'Quiz', 'Project', 'Homework', 'Participation']
    },
    score: { type: Number, required: true },
    max_score: { type: Number, required: true, default: 20 },
    percentage: { type: Number },
    graded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    date_graded: { type: Date, default: Date.now }
});

// Percentage calculated in controller
// gradeSchema.pre('save', function(next) {
//     if (this.score !== undefined && this.max_score !== undefined) {
//         this.percentage = (this.score / this.max_score) * 100;
//     }
//     next();
// });

module.exports = mongoose.model('Grade', gradeSchema);
