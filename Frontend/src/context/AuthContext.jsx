import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Ideally verify token with backend /me endpoint
                    // For speed, decoding here and fetching details
                    const decoded = jwtDecode(token);
                    // Check expiration
                    if (decoded.exp * 1000 < Date.now()) {
                        logout();
                    } else {
                        // Optimistic set
                        setUser(decoded); 
                        // Fetch full profile to be sure
                        const { data } = await api.get('/auth/me');
                        setUser(data);
                    }
                } catch (error) {
                    console.error("Auth Check Failed", error);
                    logout();
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password, role) => {
        const { data } = await api.post('/auth/login', { email, password, role });
        localStorage.setItem('token', data.token);
        setUser(data);
        // Navigate based on role
        if (role === 'student') navigate('/student/dashboard');
        else if (role === 'teacher') navigate('/teacher/dashboard');
        else if (role === 'admin') navigate('/admin/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const value = {
        user,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
