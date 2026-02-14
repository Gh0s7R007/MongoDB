import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement } from 'chart.js';

ChartJS.register(ArcElement);

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseStats, setCourseStats] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [gradeForm, setGradeForm] = useState({
        studentId: '',
        assignmentType: 'Exam', // Default
        score: '',
        maxScore: 20
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get(`/teachers/${user._id}/courses`);
                setCourses(data);
                if (data.length > 0) handleCourseSelect(data[0]._id);
            } catch (error) {
                console.error("Error fetching courses", error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchCourses();
    }, [user]);

    const handleCourseSelect = async (courseId) => {
        try {
            const course = courses.find(c => c._id === courseId);
            setSelectedCourse(course);
            
            const [statsRes, studentsRes] = await Promise.all([
                api.get(`/courses/${courseId}/statistics`),
                api.get(`/courses/${courseId}/students`)
            ]);
            
            setCourseStats(statsRes.data);
            setStudents(studentsRes.data);
            
            // Reset form
            setGradeForm(prev => ({ ...prev, studentId: '' }));
        } catch (error) {
            console.error("Error loading course data", error);
        }
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        try {
            const payload = {
                ...gradeForm,
                score: parseFloat(gradeForm.score)
            };
            await api.post(`/courses/${selectedCourse._id}/grades`, payload);
            setMessage({ type: 'success', text: 'Note ajoutée avec succès!' });
            // Refresh stats
            handleCourseSelect(selectedCourse._id);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de l\'ajout' });
        }
    };

    if (loading) return <div>Chargement...</div>;

    // Charts Data
    const assignmentLabels = courseStats?.byAssignment?.map(a => a._id) || [];
    const assignmentAvgs = courseStats?.byAssignment?.map(a => a.average) || [];

    const barData = {
        labels: assignmentLabels,
        datasets: [{
            label: 'Moyenne',
            data: assignmentAvgs,
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
        }]
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Espace Enseignant</h1>
                        <p className="text-slate-600">Département: {user.department}</p>
                    </div>
                    
                    <div className="w-full md:w-64">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sélectionner un module</label>
                        <select 
                            className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                            onChange={(e) => handleCourseSelect(e.target.value)}
                            value={selectedCourse?._id || ''}
                        >
                            {courses.map(c => (
                                <option key={c._id} value={c._id}>{c.course_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedCourse && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Grade Entry Form */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Saisir une note</h2>
                            
                            {message.text && (
                                <div className={`p-3 rounded mb-4 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleGradeSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Étudiant</label>
                                    <select 
                                        required
                                        className="w-full mt-1 p-2 border rounded-md"
                                        value={gradeForm.studentId}
                                        onChange={e => setGradeForm({ ...gradeForm, studentId: e.target.value })}
                                    >
                                        <option value="">Choisir un étudiant...</option>
                                        {students.map(s => (
                                            <option key={s._id} value={s._id}>{s.name} ({s.student_id})</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Type</label>
                                        <select 
                                            required
                                            className="w-full mt-1 p-2 border rounded-md"
                                            value={gradeForm.assignmentType}
                                            onChange={e => setGradeForm({ ...gradeForm, assignmentType: e.target.value })}
                                        >
                                            <option value="Exam">Exam</option>
                                            <option value="Quiz">Quiz</option>
                                            <option value="Project">Projet</option>
                                            <option value="Homework">Devoir</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Note (/20)</label>
                                        <input 
                                            type="number" 
                                            required min="0" max="20" step="0.5"
                                            className="w-full mt-1 p-2 border rounded-md"
                                            value={gradeForm.score}
                                            onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })}
                                        />
                                    </div>
                                </div>
                                
                                <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                                    Enregistrer
                                </button>
                            </form>
                        </div>

                        {/* Statistics Panel */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-xl text-center border">
                                    <p className="text-slate-500 text-sm">Moyenne Classe</p>
                                    <p className="text-2xl font-bold text-green-600">{courseStats?.overall?.averageScore?.toFixed(2) || '-'}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl text-center border">
                                    <p className="text-slate-500 text-sm">Note Max</p>
                                    <p className="text-2xl font-bold text-blue-600">{courseStats?.overall?.highestScore || '-'}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl text-center border">
                                    <p className="text-slate-500 text-sm">Total Notes</p>
                                    <p className="text-2xl font-bold text-slate-800">{courseStats?.overall?.totalGrades || 0}</p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-white p-6 rounded-xl border border-slate-100">
                                <h3 className="text-lg font-semibold mb-4">Performance par type d'évaluation</h3>
                                <div className="h-64">
                                    <Bar data={barData} options={{ maintainAspectRatio: false }} />
                                </div>
                            </div>

                            {/* Student List & Recent Performance */}
                            <div className="bg-white p-6 rounded-xl border border-slate-100">
                                <h3 className="text-lg font-semibold mb-4">Étudiants Inscrits</h3>
                                <div className="overflow-y-auto max-h-60">
                                    <table className="w-full text-left">
                                        <tbody className="divide-y divide-slate-100">
                                            {students.map(s => (
                                                <tr key={s._id} className="hover:bg-slate-50">
                                                    <td className="py-2">
                                                        <a 
                                                            href={`/teacher/course/${selectedCourse._id}/student/${s._id}`}
                                                            className="font-medium text-slate-800 hover:text-green-600 block"
                                                        >
                                                            {s.name}
                                                        </a>
                                                        <span className="text-xs text-slate-500">{s.student_id}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {students.length === 0 && <tr><td className="text-slate-500 py-2">Aucun étudiant inscrit.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
