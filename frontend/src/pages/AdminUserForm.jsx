import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function FormSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 p-10 mt-5">
            <div className="skeleton w-[180px] h-7 mx-auto mb-2 rounded-lg"></div>
            <div className="skeleton w-[200px] h-3.5 mx-auto mb-8 rounded-lg"></div>
            <div className="skeleton w-full h-11 mb-4 rounded-xl"></div>
            <div className="skeleton w-full h-11 mb-6 rounded-xl"></div>
            <div className="flex gap-3">
              <div className="skeleton flex-1 h-12 rounded-xl"></div>
              <div className="skeleton w-20 h-12 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUserForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit) return;
    api.get('/users').then(res => {
      const found = (res.data.content || []).find(u => String(u.id) === String(id));
      if (found) {
        setUsername(found.username);
        if (found.role) setRole(found.role);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); setServerError(''); setSubmitting(true);
    try {
      if (isEdit) { await api.put(`/users/${id}`, { username, password, role }); }
      else { await api.post('/users', { username, password, role }); }
      navigate('/admin/users');
    } catch (err) {
      if (err.response?.data?.violations) {
        const v = {};
        for (const key in err.response.data.violations) { v[key] = err.response.data.violations[key].message; }
        setErrors(v);
      } else { setServerError(err.response?.data?.message || 'Error'); }
      setSubmitting(false);
    }
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex justify-center">
        <div className="w-full max-w-md animate-in">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-xl overflow-hidden relative mt-5">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-600 to-emerald-600"></div>
            <div className="p-6 md:p-10">
              <div className="text-center pb-2">
                <h3 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
                  {isEdit ? 'Update User' : 'Create User'}
                </h3>
                <p className="text-slate-400 text-sm">{isEdit ? 'Edit user credentials' : 'Add a new user to the platform'}</p>
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2 mb-4">{serverError}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1.5">Username</label>
                  <input className="w-full bg-white border-[1.5px] border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-teal-600 focus:ring-3 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400"
                    value={username} onChange={e => setUsername(e.target.value)} disabled={submitting} placeholder="Enter username (min 4 characters)"
                  />
                  {errors.username && <small className="block mt-2 text-red-500 font-semibold text-xs">{errors.username}</small>}
                </div>
                <div className="mb-5">
                  <label className="block text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1.5">Password</label>
                  <input className="w-full bg-white border-[1.5px] border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-teal-600 focus:ring-3 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400"
                    type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={submitting} placeholder="Enter password (5-10 characters)"
                  />
                  {errors.password && <small className="block mt-2 text-red-500 font-semibold text-xs">{errors.password}</small>}
                </div>
                <div className="mb-6">
                  <label className="block text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1.5">Role</label>
                  <select className="w-full bg-white border-[1.5px] border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-teal-600 focus:ring-3 focus:ring-teal-600/10 focus:outline-none transition-all"
                    value={role} onChange={e => setRole(e.target.value)} disabled={submitting}
                  >
                    <option value="player">Player</option>
                    <option value="dev">Dev</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-premium flex-1 py-3" disabled={submitting}>
                    {submitting ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>Saving...</>) : (isEdit ? 'Update User' : 'Create User')}
                  </button>
                  <Link to="/admin/users" className={`btn-ghost py-3 px-5 ${submitting ? 'pointer-events-none' : ''}`}>Back</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
