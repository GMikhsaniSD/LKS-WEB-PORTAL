import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function UserTableSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-5">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="skeleton w-[100px] h-3.5 rounded-lg"></div>
          <div className="skeleton w-[80px] h-3.5 rounded-lg"></div>
          <div className="skeleton w-[80px] h-3.5 rounded-lg"></div>
          <div className="skeleton w-[60px] h-6 rounded-full"></div>
          <div className="flex gap-1">
            <div className="skeleton w-10 h-[26px] rounded-lg"></div>
            <div className="skeleton w-10 h-[26px] rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LockDropdown({ onSelect, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const reasons = ['Spamming', 'Cheating', 'Other'];

  return (
    <div className="relative" ref={ref}>
      <button
        className="btn-warning-glow text-xs px-3 py-1 rounded-lg"
        onClick={() => setOpen(!open)}
        disabled={disabled}
      >
        Lock ▾
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 min-w-[140px]">
          {reasons.map(reason => (
            <button
              key={reason}
              className="block w-full text-left px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-teal-600/7 hover:text-teal-600 transition-colors font-medium"
              onClick={() => { onSelect(reason); setOpen(false); }}
            >
              {reason}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadUsers = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try { const res = await api.get('/users'); setUsers(res.data.content || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    (async () => { await loadUsers(true); })();
  }, []);

  const executeAction = async () => {
    if (!confirmAction || isProcessing) return;
    const { user, reason, type } = confirmAction;
    setIsProcessing(true);
    try { 
      if (type === 'unlock') await api.post(`/users/${user.id}/unlock`);
      else await api.delete(`/users/${user.id}`, { data: { reason } }); 
    }
    catch (e) { if (e.response?.status !== 404) console.error(e.response?.data?.message || 'Action failed'); }
    finally { setConfirmAction(null); setIsProcessing(false); await loadUsers(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 animate-in">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-emerald-600 rounded-full"></div>
          <h3 className="text-xl font-bold text-slate-900 m-0">User Management</h3>
        </div>
        <Link to="/admin/users/create" className="btn-premium">+ Add User</Link>
      </div>

      {loading ? <UserTableSkeleton /> : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-in animate-in-delay-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f8fffe] border-b-2 border-slate-200">
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Created</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Last Login</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const isBlocked = u.deleted_at !== null && u.deleted_at !== undefined;
                  return (
                    <tr key={i} className="border-b border-slate-100 transition-colors hover:bg-teal-600/5">
                      <td className="px-4 py-3.5">
                        <Link to={`/profile/${u.username}`} className="text-teal-600 font-medium hover:underline">{u.username}</Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 uppercase`}>
                          {u.role || 'Player'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-slate-600 text-sm">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '--'}
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-slate-600 text-sm">
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : '--'}
                      </td>
                      <td className="px-4 py-3.5">
                        {isBlocked
                          ? <span className="bg-rose-500/8 text-rose-600 font-semibold text-xs px-3.5 py-1 rounded-full border border-rose-500/15">Blocked</span>
                          : <span className="bg-emerald-500/8 text-emerald-600 font-semibold text-xs px-3.5 py-1 rounded-full border border-emerald-500/18">Active</span>
                        }
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1 flex-wrap items-center">
                          {isBlocked ? (
                            <button
                              className="btn-outline-glass text-xs px-3 py-1 text-emerald-600 border-emerald-200"
                              onClick={() => setConfirmAction({ user: u, reason: '', type: 'unlock' })}
                            >Unlock</button>
                          ) : (
                            <LockDropdown
                              user={u}
                              disabled={false}
                              onSelect={(reason) => setConfirmAction({ user: u, reason, type: 'lock' })}
                            />
                          )}
                          {u.id && (
                            <Link
                              to={isBlocked ? '#' : `/admin/users/${u.id}/edit`}
                              className={`btn-outline-glass text-xs px-3 py-1 ${isBlocked ? 'opacity-40 pointer-events-none' : ''}`}
                              tabIndex={isBlocked ? -1 : 0}
                            >Edit</Link>
                          )}
                          <button
                            className={`btn-outline-glass text-xs px-3 py-1 text-rose-500 border-rose-200 ${isBlocked ? 'opacity-40 pointer-events-none' : ''}`}
                            onClick={() => !isBlocked && setConfirmAction({ user: u, reason: 'Deleted by administrator', type: 'delete' })}
                            disabled={isBlocked}
                          >Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-center mt-3">
        <small className="text-slate-400">{users.length} total users</small>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center" onClick={() => setConfirmAction(null)}>
          <div className="animate-in bg-white/95 backdrop-blur-xl rounded-2xl p-9 max-w-[420px] w-[90%] shadow-xl text-center border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-bold mb-2 text-slate-900">
              {confirmAction.type === 'delete' ? 'Delete User' : (confirmAction.type === 'unlock' ? 'Unlock User' : 'Lock User')}
            </h4>
            <p className="text-slate-600 mb-6 text-sm">
              {confirmAction.type === 'delete'
                ? `Are you sure you want to delete "${confirmAction.user.username}"?`
                : (confirmAction.type === 'unlock' ? `Are you sure you want to unlock "${confirmAction.user.username}"?` : `Block "${confirmAction.user.username}" for "${confirmAction.reason}"?`)}
            </p>
            <div className="flex gap-3 justify-center">
              <button className="btn-ghost px-7 py-2.5" onClick={() => setConfirmAction(null)} disabled={isProcessing}>Cancel</button>
              <button className={confirmAction.type === 'delete' ? 'btn-danger-glow px-7 py-2.5' : (confirmAction.type === 'unlock' ? 'btn-success-glow px-7 py-2.5' : 'btn-warning-glow px-7 py-2.5')} onClick={executeAction} disabled={isProcessing}>
                {isProcessing ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>Processing...</>) : (confirmAction.type === 'delete' ? 'Delete' : (confirmAction.type === 'unlock' ? 'Unlock' : 'Lock'))}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
