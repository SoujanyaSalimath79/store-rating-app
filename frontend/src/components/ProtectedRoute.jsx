import { Navigate } from 'react-router-dom';
import { HOME_BY_ROLE, useAuth } from '../AuthContext';

export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
  return children;
}
