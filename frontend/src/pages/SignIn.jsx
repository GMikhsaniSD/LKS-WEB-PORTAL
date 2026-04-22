import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate(isAdmin ? '/admin' : '/games', { replace: true });
  }, [token, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/signin', { username, password });
      const role = res.data.role || 'user';
      login(res.data.token, username, role);
      navigate(role === 'admin' ? '/admin' : '/games', { replace: true });
    } catch (err) {
      if (err.response?.data?.status === 'blocked') {
        setError('Account Blocked: ' + (err.response.data.reason || 'No reason provided'));
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full p-5 bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 relative overflow-hidden">
      <div className="absolute -top-[30%] -right-[20%] w-[600px] h-[600px] bg-radial-[at_center] from-teal-600/8 to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-[20%] -left-[15%] w-[500px] h-[500px] bg-radial-[at_center] from-emerald-600/6 to-transparent pointer-events-none"></div>

      <div className="w-full max-w-[440px] animate-in relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
            <span className="text-slate-900">Portal</span><span className="bg-gradient-to-br from-teal-600 to-emerald-600 bg-clip-text text-transparent">Game</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Online Browser Gaming Platform</p>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-600 to-emerald-600"></div>
          <div className="p-6 md:p-10">
            <div className="text-center pb-2">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>Welcome Back</h3>
              <p className="text-slate-400 text-sm">Sign in to continue your journey</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2 animate-in mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1.5">Username</label>
                <input
                  className="w-full bg-white border-[1.5px] border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-teal-600 focus:ring-3 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400"
                  value={username} onChange={e => setUsername(e.target.value)} required disabled={loading}
                  placeholder="Enter your username" autoComplete="username"
                />
              </div>
              <div className="mb-5 relative">
                <label className="block text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input
                    className="w-full bg-white border-[1.5px] border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-teal-600 focus:ring-3 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400 pr-12"
                    type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required disabled={loading}
                    placeholder="Enter your password" autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    disabled={loading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <button type="submit" className="btn-premium w-full py-3 text-base" disabled={loading}>
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>Authenticating...</>
                  ) : 'Sign In'}
                </button>
                <Link replace to="/signup" className="btn-ghost w-full py-3 text-center text-sm">
                  Create an Account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
