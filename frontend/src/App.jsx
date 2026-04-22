import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import DiscoverGames from './pages/DiscoverGames';
import GameDetail from './pages/GameDetail';
import ManageGames from './pages/ManageGames';
import ManageGameForm from './pages/ManageGameForm';
import ManageGameUpdate from './pages/ManageGameUpdate';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminUserForm from './pages/AdminUserForm';
import AdminAdmins from './pages/AdminAdmins';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
}

function UserRoute({ children }) {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/" />;
  if (isAdmin) return <Forbidden />;
  return children;
}

function Forbidden() {
  const { isAdmin } = useAuth();
  return (
    <div className="error-page">
      <div className="error-code">403</div>
      <h2>Forbidden</h2>
      <p>You do not have permission to access this area.</p>
      <Link to={isAdmin ? "/admin" : "/games"} className="btn-premium">Go to Dashboard</Link>
    </div>
  );
}

function NotFound() {
  const { token, isAdmin } = useAuth();
  const homeTarget = token ? (isAdmin ? "/admin" : "/games") : "/";
  return (
    <div className="error-page">
      <div className="error-code">404</div>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to={homeTarget} className="btn-premium">Go to Homepage</Link>
    </div>
  );
}

function AdminRoute({ children }) {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/" />;
  if (!isAdmin) return <Forbidden />;
  return children;
}

function GuestRoute({ children }) {
  const { token, isAdmin } = useAuth();
  if (token) return <Navigate to={isAdmin ? "/admin" : "/games"} />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Guest only (sudah login = redirect) */}
        <Route path="/" element={<GuestRoute><SignIn /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignUp /></GuestRoute>} />

        {/* User only (harus login + bukan admin) */}
        <Route path="/games" element={<UserRoute><DiscoverGames /></UserRoute>} />
        <Route path="/games/:slug" element={<UserRoute><GameDetail /></UserRoute>} />
        <Route path="/manage" element={<UserRoute><ManageGames /></UserRoute>} />
        <Route path="/manage/create" element={<UserRoute><ManageGameForm /></UserRoute>} />
        <Route path="/manage/:slug/edit" element={<UserRoute><ManageGameUpdate /></UserRoute>} />
        <Route path="/profile/:username" element={<UserRoute><Profile /></UserRoute>} />

        {/* Admin only */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/users/create" element={<AdminRoute><AdminUserForm /></AdminRoute>} />
        <Route path="/admin/users/:id/edit" element={<AdminRoute><AdminUserForm /></AdminRoute>} />
        <Route path="/admin/admins" element={<AdminRoute><AdminAdmins /></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
