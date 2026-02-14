import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentCourseDetails from './pages/StudentCourseDetails';
import TeacherStudentDetails from './pages/TeacherStudentDetails';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route element={<ProtectedRoute role="student" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/course/:id" element={<StudentCourseDetails />} />
          </Route>

          <Route element={<ProtectedRoute role="teacher" />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/course/:courseId/student/:studentId" element={<TeacherStudentDetails />} />
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
