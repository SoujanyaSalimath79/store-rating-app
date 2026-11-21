import { Navigate, Route, Routes } from 'react-router-dom';
import { HOME_BY_ROLE, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import ChangePassword from './pages/ChangePassword';
import Login from './pages/Login';
import OwnerDashboard from './pages/OwnerDashboard';
import Signup from './pages/Signup';
import UserStores from './pages/UserStores';

export default function App() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to={user ? HOME_BY_ROLE[user.role] : '/login'} replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/stores" element={<ProtectedRoute roles={['USER']}><UserStores /></ProtectedRoute>} />
          <Route path="/owner" element={<ProtectedRoute roles={['OWNER']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
