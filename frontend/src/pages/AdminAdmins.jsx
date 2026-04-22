import { useState, useEffect } from 'react';
import api from '../api/axios';

function AdminTableSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-5">
      {[1,2,3].map(i => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="skeleton w-8 h-8 rounded-full"></div>
          <div className="skeleton w-[120px] h-3.5 rounded-lg"></div>
          <div className="skeleton w-[100px] h-3.5 rounded-lg"></div>
          <div className="skeleton w-[100px] h-3.5 rounded-lg"></div>
          <div className="skeleton w-[80px] h-3.5 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
}

export default function AdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Delete State
  const [deleteAdmin, setDeleteAdmin] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const loadAdmins = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try { const res = await api.get('/admins'); setAdmins(res.data.content || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAdmins(true); }, []);

  const openCreateModal = () => {
    setIsEdit(false); setCurrentId(null); setUsername(''); setPassword('');
    setErrors({}); setServerError(''); setShowModal(true);
  };

  const openEditModal = (a) => {
    setIsEdit(true); setCurrentId(a.id); setUsername(a.username); setPassword('');
    setErrors({}); setServerError(''); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); setServerError(''); setIsProcessing(true);
    try {
      if (isEdit) await api.put(`/admins/${currentId}`, { username, password });
      else await api.post('/admins', { username, password });
      setShowModal(false);
      await loadAdmins();
    } catch (err) {
      if (err.response?.data?.violations) {
        const v = {};
        for (const key in err.response.data.violations) { v[key] = err.response.data.violations[key].message; }
        setErrors(v);
      } else { setServerError(err.response?.data?.message || 'Action failed'); }
    } finally { setIsProcessing(false); }
  };

  const executeDelete = async () => {
    if (!deleteAdmin || isProcessing) return;
    setIsProcessing(true); setDeleteError('');
    try {
      await api.delete(`/admins/${deleteAdmin.id}`);
      setDeleteAdmin(null);
      await loadAdmins();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Delete failed');
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 animate-in">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-emerald-600 rounded-full"></div>
          <h3 className="text-xl font-bold text-slate-900 m-0">Administrators</h3>
          <span className="bg-teal-600/7 text-teal-600 font-semibold text-xs px-3.5 py-1 rounded-full border border-teal-600/15">
            {loading ? '...' : `${admins.length} admins`}
          </span>
        </div>
        <button onClick={openCreateModal} className="btn-premium">+ Add Administrator</button>
      </div>

      {loading ? <AdminTableSkeleton /> : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-in animate-in-delay-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f8fffe] border-b-2 border-slate-200">
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a, i) => (
                  <tr key={i} className="border-b border-slate-100 transition-colors hover:bg-teal-600/5">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                          {a.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">{a.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-sm">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-sm">
                      {a.last_login_at ? new Date(a.last_login_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right flex gap-1 justify-end flex-wrap">
                      <button onClick={() => openEditModal(a)} className="btn-outline-glass text-xs px-3 py-1">Edit</button>
                      {admins.length <= 1 ? (
                        <button disabled title="Cannot delete the last remaining admin" className="inline-flex items-center justify-center rounded-lg border border-slate-200 text-xs px-3 py-1 text-slate-400 opacity-50 cursor-not-allowed bg-slate-50/50">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 inline-block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                        </button>
                      ) : (
                        <button onClick={() => setDeleteAdmin(a)} className="btn-outline-glass text-xs px-3 py-1 text-rose-500 border-rose-200">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => !isProcessing && setShowModal(false)}>
          <div className="animate-in bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-3xl"></div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{isEdit ? 'Update Administrator' : 'Create Administrator'}</h3>
            <p className="text-slate-500 text-sm mb-6">{isEdit ? 'Edit admin credentials' : 'Add new admin access'}</p>
            
            {serverError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">{serverError}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1.5">Username</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  value={username} onChange={e => setUsername(e.target.value)} disabled={isProcessing} required
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>
              <div className="mb-6">
                <label className="block text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1.5">Password</label>
                <input type="password" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  value={password} onChange={e => setPassword(e.target.value)} disabled={isProcessing} required
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={isProcessing} className="btn-premium flex-1">
                  {isProcessing ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} disabled={isProcessing} className="btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => !isProcessing && setDeleteAdmin(null)}>
          <div className="animate-in bg-white border border-slate-200 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center" onClick={e => e.stopPropagation()}>
            <h4 className="font-bold text-lg mb-2 text-slate-900">Delete Administrator</h4>
            <p className="text-slate-600 mb-6 text-sm">
              Are you sure you want to delete administrator "{deleteAdmin.username}"? This action cannot be undone.
            </p>
            {deleteError && <div className="bg-red-50 text-red-600 p-2 rounded-lg text-xs mb-4 border border-red-100">{deleteError}</div>}
            <div className="flex gap-3 justify-center">
              <button className="btn-ghost px-5 py-2.5" onClick={() => setDeleteAdmin(null)} disabled={isProcessing}>Cancel</button>
              <button className="btn-danger-glow px-5 py-2.5" onClick={executeDelete} disabled={isProcessing}>
                {isProcessing ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
