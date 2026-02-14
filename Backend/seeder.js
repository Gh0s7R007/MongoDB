const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Course = require('./models/Course');
const Grade = require('./models/Grade');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await Student.deleteMany();
        await Teacher.deleteMany();
        await Course.deleteMany();
        await Grade.deleteMany();
        await Admin.deleteMany();

        console.log('Data Destroyed...');

        await Admin.create({
            name: 'Admin Principal',
            email: 'admin@univ.ma',
            password: 'password123'
        });
        console.log('Admin Created...');

        const teachersData = [
            { teacher_id: 'T001', name: 'Dr. Mohamed Alami', email: 'mohamed.alami@univ.ma', password: 'password123', department: 'Génie Logiciel' },
            { teacher_id: 'T002', name: 'Mme. Fatima Benellal', email: 'fatima.benellal@univ.ma', password: 'password123', department: 'Réseaux et Télécoms' },
            { teacher_id: 'T003', name: 'Pr. Yassine OUKDACH', email: 'yassine.oukdach@univ.ma', password: 'password123', department: 'Science des Données' },
            { teacher_id: 'T004', name: 'Dr. Karima Mansouri', email: 'karima.mansouri@univ.ma', password: 'password123', department: 'Intelligence Artificielle' },
            { teacher_id: 'T005', name: 'Pr. Hassan Tazi', email: 'hassan.tazi@univ.ma', password: 'password123', department: 'Systèmes Embarqués' }
        ];

        const createdTeachers = [];
        for (const teacher of teachersData) {
            const newTeacher = await Teacher.create(teacher);
            createdTeachers.push(newTeacher);
        }

        const coursesData = [
            { course_id: 'C101', course_name: 'Algorithmique et Structures de Données', course_code: 'INFO101', credits: 4, semester: 'S1', teacher: createdTeachers[0]._id },
            { course_id: 'C102', course_name: 'Architecture des Ordinateurs', course_code: 'INFO102', credits: 3, semester: 'S1', teacher: createdTeachers[4]._id },
            { course_id: 'C201', course_name: 'Bases de Données Relationnelles', course_code: 'INFO201', credits: 4, semester: 'S2', teacher: createdTeachers[2]._id },
            { course_id: 'C202', course_name: 'Développement Web Full-Stack', course_code: 'INFO202', credits: 5, semester: 'S2', teacher: createdTeachers[0]._id },
            { course_id: 'C301', course_name: 'Réseaux Informatiques', course_code: 'INFO301', credits: 4, semester: 'S3', teacher: createdTeachers[1]._id },
            { course_id: 'C302', course_name: 'Systèmes d\'Exploitation', course_code: 'INFO302', credits: 4, semester: 'S3', teacher: createdTeachers[4]._id },
            { course_id: 'C401', course_name: 'Intelligence Artificielle', course_code: 'INFO401', credits: 5, semester: 'S4', teacher: createdTeachers[3]._id },
            { course_id: 'C402', course_name: 'Sécurité Informatique', course_code: 'INFO402', credits: 4, semester: 'S4', teacher: createdTeachers[1]._id },
            { course_id: 'C501', course_name: 'Big Data & Cloud Computing', course_code: 'INFO501', credits: 5, semester: 'S5', teacher: createdTeachers[2]._id },
            { course_id: 'C502', course_name: 'Projet de Fin d\'Études', course_code: 'PFE502', credits: 10, semester: 'S6', teacher: createdTeachers[0]._id },
        ];

        const createdCourses = [];
        for (const course of coursesData) {
            const newCourse = await Course.create(course);
            createdCourses.push(newCourse);
            
            await Teacher.findByIdAndUpdate(course.teacher, { $push: { assigned_courses: newCourse._id } });
        }

        const studentNames = [
            'Omar Berrada', 'Salma Bennani', 'Yassine Tazi', 'Hajar El Idrissi', 'Mehdi Chraibi',
            'Kenza Alami', 'Amine Fassi', 'Rim Benjelloun', 'Nizar Sefraoui', 'Houda Mansouri',
            'Anas Boukhriss', 'Lina Amrani', 'Ziad Daher', 'Noura Ettahri', 'Said Ouazzani',
            'Meryem Kadiri', 'Younes Belkady', 'Sofia Naciri', 'Karim Lazrak', 'Ghita Benkirane',
            'Hamza Filali', 'Rania Benchekroun', 'Othmane Iraqui', 'Zineb Jaidi', 'Tarik Hassani',
            'Ines El Fassi', 'Walid Daoudi', 'Samia Touhami', 'Riad Bennani', 'Leila Chami'
        ];

        const createdStudents = [];
        for (let i = 0; i < studentNames.length; i++) {
            const student = await Student.create({
                student_id: `S2024${100 + i}`,
                name: studentNames[i],
                email: `${studentNames[i].toLowerCase().replace(' ', '.')}@student.univ.ma`,
                password: 'password123',
                academic_year: '2025-2026',
                enrolled_courses: []
            });
            createdStudents.push(student);
        }

        const grades = [];
        const assignmentTypes = ['Exam', 'Quiz', 'Project', 'Homework'];
        let gradeCounter = 1;

        for (const student of createdStudents) {
            const shuffledCourses = createdCourses.sort(() => 0.5 - Math.random()).slice(0, 5);
            
            for (const course of shuffledCourses) {
                await Student.findByIdAndUpdate(student._id, { $push: { enrolled_courses: course._id } });
                await Course.findByIdAndUpdate(course._id, { $push: { enrolled_students: student._id } });
                for (const type of assignmentTypes) {
                    const min = 5;
                    const max = 20;
                    let score = Math.floor((Math.random() * (max - min + 1) + min) * 2) / 2;
                    if (score > 20) score = 20;

                    grades.push({
                        grade_id: `G${gradeCounter++}`,
                        student: student._id,
                        course: course._id,
                        assignment_type: type,
                        score: score,
                        max_score: 20,
                        graded_by: course.teacher
                    });
                }
            }
        }

        await Grade.insertMany(grades);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
