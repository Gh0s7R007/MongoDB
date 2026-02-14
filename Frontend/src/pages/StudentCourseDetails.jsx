import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ArrowLeft, Book, User } from 'lucide-react';

const StudentCourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                if (!user) return; // Wait for user to be loaded

                // Fetch course info and ALL student grades (then filter)
                // In a production app, we should have a specific endpoint for grades of a course
                const [courseRes, gradesRes] = await Promise.all([
                    api.get(`/courses/${id}`),
                    api.get(`/students/${user._id}/grades`)
                ]);
                
                setCourse(courseRes.data);
                // Filter grades for this course
                const courseGrades = gradesRes.data.filter(g => g.course._id === id || g.course === id); // Handle populated vs unpopulated
                setGrades(courseGrades);
            } catch (error) {
                console.error("Error fetching course details", error);
                setError(error.message || 'Erreur de chargement');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDetails();
    }, [id, user]);

    if (loading) return <div className="p-8 text-center bg-slate-50 min-h-screen">Chargement...</div>;
    if (error) return <div className="p-8 text-center bg-slate-50 min-h-screen text-red-600">Erreur: {error} (ID: {id})</div>;
    if (!course) return <div className="p-8 text-center bg-slate-50 min-h-screen">Cours introuvable</div>;

    // Calculate Average for this course
    const totalScore = grades.reduce((acc, curr) => acc + curr.score, 0);
    const average = grades.length > 0 ? (totalScore / grades.length).toFixed(2) : '-';

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button 
                    onClick={() => navigate('/student/dashboard')}
                    className="flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors"
                >
                    <ArrowLeft size={18} className="mr-2" /> Retour au tableau de bord
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                    <div className="p-8 border-b border-slate-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 mb-2">{course.course_name}</h1>
                                <p className="text-slate-500 text-lg flex items-center">
                                    <span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm mr-3 text-slate-600">{course.course_code}</span>
                                    {course.semester} • {course.credits} Crédits
                                </p>
                            </div>
                            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                                <p className="text-sm text-blue-600 font-medium">Moyenne Actuelle</p>
                                <p className="text-2xl font-bold text-blue-700">{average}/20</p>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex items-center text-slate-600">
                            <User size={18} className="mr-2" />
                            <span className="font-medium mr-2">Enseignant:</span> 
                            {course.teacher?.name}
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <Book size={20} className="mr-2 text-blue-600" /> Notes et Évaluations
                </h2>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    {grades.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr className="border-b border-slate-100 text-slate-500 text-sm uppercase">
                                    <th className="px-6 py-4 font-semibold">Type</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold text-right">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {grades.map(grade => (
                                    <tr key={grade._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800 capitalize">{grade.assignment_type}</td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(grade.date_graded).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold ${grade.score >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                                                {grade.score}
                                            </span>
                                            <span className="text-slate-400 text-sm">/{grade.max_score}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            Aucune note enregistrée pour ce cours.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentCourseDetails;
