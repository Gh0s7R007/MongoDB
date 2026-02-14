import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Users, BookOpen, Trash2, Plus, GraduationCap, Eye } from 'lucide-react';

const AdminDashboard = () => {
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('students');
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    
    // Modal State
    const [showModal, setShowModal] = useState(null); // 'student', 'teacher', 'course', 'enroll'
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState('');

    const fetchData = async () => {
        try {
            const [studentsRes, teachersRes, coursesRes] = await Promise.all([
                api.get('/admin/students'),
                api.get('/admin/teachers'),
                api.get('/courses') // Use public route for list
            ]);
            setStudents(studentsRes.data);
            setTeachers(teachersRes.data);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleViewStudents = async (courseId) => {
        try {
            const res = await api.get(`/admin/courses/${courseId}/students`);
            setEnrolledStudents(res.data);
            openModal('view_students', courseId);
        } catch (error) {
            alert('Erreur lors du chargement des étudiants');
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
        try {
            await api.delete(`/admin/users/${type}/${id}`);
            fetchData();
        } catch (error) {
            alert('Erreur: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            if (showModal === 'student') {
                await api.post('/admin/students', formData);
            } else if (showModal === 'teacher') {
                await api.post('/admin/teachers', formData);
            } else if (showModal === 'course') {
                await api.post('/admin/courses', formData);
            } else if (showModal === 'enroll') {
                await api.post('/admin/enroll', { ...formData, courseId: selectedCourseId });
            }
            
            setShowModal(null);
            setFormData({});
            fetchData();
            alert('Opération réussie !');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Erreur lors de l\'opération');
        }
    };

    const openModal = (type, courseId = null) => {
        setShowModal(type);
        setSelectedCourseId(courseId);
        setFormData({});
        setMessage('');
    };

    if (loading) return <div className="p-8 text-center bg-slate-50 min-h-screen">Chargement...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Panneau d'Administration</h1>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    <div className="flex border-b border-slate-100">
                        {['students', 'teachers', 'courses'].map(tab => (
                            <button
                                key={tab}
                                className={`flex-1 py-4 text-center font-medium capitalize transition-colors ${
                                    activeTab === tab 
                                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'students' ? 'Étudiants' : tab === 'teachers' ? 'Enseignants' : 'Modules'}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        <div className="flex justify-end mb-4">
                            <button 
                                onClick={() => openModal(activeTab === 'courses' ? 'course' : activeTab === 'students' ? 'student' : 'teacher')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
                            >
                                <Plus size={18} className="mr-2" /> Ajouter
                            </button>
                        </div>

                        {activeTab === 'students' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr className="text-slate-500 text-sm uppercase">
                                            <th className="px-4 py-3">Nom</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">ID</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {students.map(s => (
                                            <tr key={s._id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium">{s.name}</td>
                                                <td className="px-4 py-3 text-slate-600">{s.email}</td>
                                                <td className="px-4 py-3 text-slate-500">{s.student_id}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleDelete('student', s._id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'teachers' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr className="text-slate-500 text-sm uppercase">
                                            <th className="px-4 py-3">Nom</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Département</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {teachers.map(t => (
                                            <tr key={t._id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium">{t.name}</td>
                                                <td className="px-4 py-3 text-slate-600">{t.email}</td>
                                                <td className="px-4 py-3 text-slate-500">{t.department}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleDelete('teacher', t._id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr className="text-slate-500 text-sm uppercase">
                                            <th className="px-4 py-3">Code</th>
                                            <th className="px-4 py-3">Nom du Module</th>
                                            <th className="px-4 py-3">Semestre</th>
                                            <th className="px-4 py-3">Enseignant</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {courses.map(c => (
                                            <tr key={c._id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-mono text-sm bg-slate-50 rounded">{c.course_code}</td>
                                                <td className="px-4 py-3 font-medium">{c.course_name}</td>
                                                <td className="px-4 py-3 text-slate-600">{c.semester}</td>
                                                <td className="px-4 py-3 text-slate-600">{c.teacher?.name || 'Non assigné'}</td>
                                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleViewStudents(c._id)}
                                                        className="text-slate-500 hover:text-blue-600 p-1"
                                                        title="Voir les étudiants inscrits"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => openModal('enroll', c._id)}
                                                        className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                                                        title="Inscrire un étudiant"
                                                    >
                                                        <Plus size={16} className="mr-1" /> Inscrire
                                                    </button>
                                                    {/* Course deletion not implemented yet in backend but good to have UI */}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">
                                {showModal === 'view_students' ? 'Étudiants Inscrits' : 
                                 showModal === 'student' ? 'Ajouter un Étudiant' : 
                                 showModal === 'teacher' ? 'Ajouter un Enseignant' : 
                                 showModal === 'course' ? 'Ajouter un Module' : 
                                 'Inscrire un Étudiant'}
                            </h2>
                            
                            {message && <p className="mb-4 text-red-600 text-sm bg-red-50 p-2 rounded">{message}</p>}

                            {showModal === 'view_students' ? (
                                <div>
                                    {enrolledStudents.length === 0 ? (
                                        <p className="text-slate-500 text-center py-4">Aucun étudiant inscrit.</p>
                                    ) : (
                                        <ul className="divide-y divide-slate-100">
                                            {enrolledStudents.map(s => (
                                                <li key={s._id} className="py-3 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-slate-800">{s.name}</p>
                                                        <p className="text-xs text-slate-500">{s.student_id}</p>
                                                    </div>
                                                    <a href={`mailto:${s.email}`} className="text-blue-500 text-sm hover:underline">Email</a>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <div className="mt-6 text-right">
                                        <button onClick={() => setShowModal(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200">Fermer</button>
                                    </div>
                                </div>
                            ) : (
                            <form onSubmit={handleCreate} className="space-y-4">
                                {showModal === 'student' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Nom Complet</label>
                                        <input 
                                            required
                                            className="w-full border p-2 rounded"
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Email et ID seront générés automatiquement.</p>
                                    </div>
                                )}

                                {showModal === 'teacher' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Nom Complet</label>
                                            <input 
                                                required
                                                className="w-full border p-2 rounded"
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Département</label>
                                            <input 
                                                required
                                                className="w-full border p-2 rounded"
                                                onChange={e => setFormData({...formData, department: e.target.value})}
                                            />
                                        </div>
                                    </>
                                )}

                                {showModal === 'course' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Nom du Module</label>
                                            <input required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, course_name: e.target.value})} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Code</label>
                                                <input required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, course_code: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Crédits</label>
                                                <input type="number" required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, credits: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Semestre</label>
                                                <select className="w-full border p-2 rounded" onChange={e => setFormData({...formData, semester: e.target.value})}>
                                                    <option value="S1">S1</option><option value="S2">S2</option>
                                                    <option value="S3">S3</option><option value="S4">S4</option>
                                                    <option value="S5">S5</option><option value="S6">S6</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Enseignant</label>
                                                <select className="w-full border p-2 rounded" onChange={e => setFormData({...formData, teacherId: e.target.value})}>
                                                    <option value="">Sélectionner...</option>
                                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {showModal === 'enroll' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Étudiant à inscrire</label>
                                        <select required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, studentId: e.target.value})}>
                                            <option value="">Sélectionner un étudiant...</option>
                                            {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.student_id})</option>)}
                                        </select>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 mt-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(null)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Confirmer
                                    </button>
                                </div>
                            </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
