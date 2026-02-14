import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, BookOpen } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: 'omar.berrada@student.univ.ma', // Default for demo
        password: 'password123',
        role: 'student'
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password, formData.role);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <GraduationCap className="text-blue-600" size={40} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
                        Portail Académique
                    </h2>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'student', email: 'omar.berrada@student.univ.ma' })}
                                    className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                                        formData.role === 'student' 
                                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                    }`}
                                >
                                    <User size={20} className="mr-2" /> Etudiant
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'teacher', email: 'mohamed.alami@univ.ma' })}
                                    className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                                        formData.role === 'teacher' 
                                            ? 'border-green-500 bg-green-50 text-green-700' 
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                    }`}
                                >
                                    <BookOpen size={20} className="mr-2" /> Enseignant
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                                formData.role === 'student' 
                                    ? 'bg-blue-600 hover:bg-blue-700' 
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            Se connecter
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <a href="/admin/login" className="text-sm text-slate-400 hover:text-blue-600 transition-colors">
                            Accès Administration
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
