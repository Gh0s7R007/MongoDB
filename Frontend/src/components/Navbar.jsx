import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <nav className={`shadow-md ${user.role === 'student' ? 'bg-blue-600' : 'bg-green-600'} text-white`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <GraduationCap size={28} />
                            <span className="font-bold text-xl">AcademicTracker</span>
                        </Link>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">
                            {user.name} ({user.role === 'student' ? 'Etudiant' : 'Enseignant'})
                        </span>
                        <button 
                            onClick={logout}
                            className="p-2 rounded-full hover:bg-opacity-20 hover:bg-white transition-all"
                            title="Déconnexion"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
