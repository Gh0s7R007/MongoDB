import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { ArrowLeft, User, GraduationCap, Calendar } from 'lucide-react';

const TeacherStudentDetails = () => {
    const { courseId, studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [grades, setGrades] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Student Info (we might need a specific endpoint or reuse list)
                // Here we fetch all grades and filter, and get course info
                const [gradesRes, courseRes] = await Promise.all([
                    api.get(`/students/${studentId}/grades`),
                    api.get(`/courses/${courseId}`)
                ]);

                // Filter grades for this course
                const courseGrades = gradesRes.data.filter(g => g.course._id === courseId || g.course === courseId);
                setGrades(courseGrades);
                setCourse(courseRes.data);
                
                // We assume the student object is populated in the grades or we can fetch it separately if needed
                // For now, let's try to extract student info from the first grade if available, 
                // or we need a proper endpoint to fetch student details. 
                // Let's assume we need to fetch student name. The grades endpoint might not have full student info if looking from student perspective.
                // Let's try to fetch enrolled students of the course to find the name 
                const studentsRes = await api.get(`/courses/${courseId}/students`);
                const foundStudent = studentsRes.data.find(s => s._id === studentId);
                setStudent(foundStudent);

            } catch (error) {
                console.error("Error fetching details", error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId && studentId) fetchData();
    }, [courseId, studentId]);

    const calculateAverage = () => {
        if (grades.length === 0) return 0;
        const total = grades.reduce((acc, curr) => acc + curr.score, 0);
        return (total / grades.length).toFixed(2);
    };

    if (loading) return <div className="p-8 text-center bg-slate-50 min-h-screen">Chargement...</div>;
    if (!student || !course) return <div className="p-8 text-center bg-slate-50 min-h-screen">Introuvable</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button 
                    onClick={() => navigate('/teacher/dashboard')}
                    className="flex items-center text-slate-500 hover:text-green-600 mb-6 transition-colors"
                >
                    <ArrowLeft size={18} className="mr-2" /> Retour au tableau de bord
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                    <div className="p-8 border-b border-slate-100">
                        <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
                                    <User className="mr-3 text-green-600" size={32} />
                                    {student.name}
                                </h1>
                                <p className="text-slate-500 flex items-center">
                                    <GraduationCap size={16} className="mr-2" />
                                    {student.email}
                                </p>
                            </div>
                            <div className="bg-green-50 px-6 py-3 rounded-xl border border-green-100 text-center">
                                <p className="text-sm text-green-600 font-medium uppercase tracking-wide">Moyenne</p>
                                <p className="text-3xl font-bold text-green-700">{calculateAverage()}/20</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-8 py-4 border-b border-slate-100">
                        <p className="text-slate-600 font-medium">
                            Module: <span className="text-slate-900">{course.course_name}</span> ({course.course_code})
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800">Historique des Notes</h2>
                    </div>
                    
                    {grades.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr className="text-slate-500 text-sm uppercase">
                                    <th className="px-8 py-4 font-semibold">Type</th>
                                    <th className="px-8 py-4 font-semibold">Date</th>
                                    <th className="px-8 py-4 font-semibold text-right">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {grades.map(grade => (
                                    <tr key={grade._id} className="hover:bg-slate-50">
                                        <td className="px-8 py-4 font-medium text-slate-800 capitalize">
                                            {grade.assignment_type}
                                        </td>
                                        <td className="px-8 py-4 text-slate-500 flex items-center">
                                            <Calendar size={14} className="mr-2" />
                                            {new Date(grade.date_graded).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <span className={`font-bold px-2 py-1 rounded text-sm ${
                                                grade.score >= 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {grade.score}/{grade.max_score}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            Aucune note enregistrée pour cet étudiant dans ce module.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherStudentDetails;
