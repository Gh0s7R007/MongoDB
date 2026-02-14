import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminLogin = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: 'admin@univ.ma',
        password: 'password123',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password, 'admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="bg-red-900/50 p-3 rounded-full border border-red-500/50">
                            <ShieldAlert className="text-red-500" size={40} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-white mb-2">
                        Administration
                    </h2>
                    <p className="text-center text-slate-400 mb-8">Accès réservé aux administrateurs</p>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Email Administrateur</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder-slate-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Code d'accès</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder-slate-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center"
                        >
                            <Lock size={18} className="mr-2" /> Connexion Sécurisée
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-slate-400 hover:text-white text-sm flex items-center justify-center transition-colors">
                            <ArrowLeft size={16} className="mr-1" /> Retour au portail principal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
