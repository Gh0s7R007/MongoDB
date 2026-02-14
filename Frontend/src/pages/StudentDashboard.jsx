import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const StudentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, gradesRes] = await Promise.all([
                    api.get(`/students/${user._id}/statistics`),
                    api.get(`/students/${user._id}/grades`)
                ]);
                setStats(statsRes.data);
                setGrades(gradesRes.data);
            } catch (error) {
                console.error("Error fetching student data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    if (loading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Chargement...</div>;
    }

    // Prepare Chart Data
    const courseLabels = stats?.byCourse?.map(c => c._id) || [];
    const courseAverages = stats?.byCourse?.map(c => c.average) || [];

    const barData = {
        labels: courseLabels,
        datasets: [
            {
                label: 'Moyenne par module',
                data: courseAverages,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Performance Académique' },
        },
        scales: {
            y: { beginAtZero: true, max: 20 }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Bonjour, {user.name}</h1>
                    <p className="text-slate-600">Année académique: {user.academic_year}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-sm font-medium text-slate-500">Moyenne Générale</p>
                        <p className="text-3xl font-bold text-blue-600">{stats?.overall?.averageScore?.toFixed(2) || '-'}/20</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-sm font-medium text-slate-500">Total Évaluations</p>
                        <p className="text-3xl font-bold text-slate-800">{stats?.overall?.totalGrades || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-sm font-medium text-slate-500">Meilleure Note</p>
                        <p className="text-3xl font-bold text-green-500">{stats?.overall?.highestScore || '-'}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-sm font-medium text-slate-500">Moins Bonne Note</p>
                        <p className="text-3xl font-bold text-red-500">{stats?.overall?.lowestScore || '-'}</p>
                    </div>
                </div>

                {/* Charts & Recent Grades */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart Section */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <Bar options={options} data={barData} />
                    </div>

                    {/* Recent Grades List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Dernières Notes</h2>
                        <div className="space-y-4 overflow-y-auto max-h-[400px]">
                            {grades.map((grade) => (
                                <div key={grade._id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-slate-800 hover:text-blue-600 cursor-pointer">
                                                <a href={`/student/course/${grade.course?._id || grade.course}`}>
                                                    {grade.course?.course_name}
                                                </a>
                                            </p>
                                            <p className="text-sm text-slate-500 capitalize">{grade.assignment_type}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-sm font-bold ${
                                            grade.score >= 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {grade.score}/{grade.max_score}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {new Date(grade.date_graded).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                            {grades.length === 0 && <p className="text-slate-500">Aucune note disponible.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
