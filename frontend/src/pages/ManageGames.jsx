import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function TableSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-5">
      {[1,2,3,4].map(i => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="skeleton w-12 h-12 rounded-lg"></div>
          <div className="flex-1">
            <div className="skeleton w-1/2 h-3.5 rounded-lg mb-1.5"></div>
            <div className="skeleton w-3/4 h-3 rounded-lg"></div>
          </div>
          <div className="flex gap-1">
            <div className="skeleton w-[50px] h-7 rounded-lg"></div>
            <div className="skeleton w-[50px] h-7 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ManageGames() {
  const { username } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteSlug, setDeleteSlug] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_API_URL.includes('http') 
    ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
    : '/serve-game-files';

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchGames = async () => {
    setLoading(true);
    try { const res = await api.get(`/users/${username}`); setGames(res.data.authoredGames || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGames(); }, []);

  const executeDelete = async () => {
    if (!deleteSlug || isDeleting) return;
    setIsDeleting(true);
    try { await api.delete(`/games/${deleteSlug}`); showToast('Game deleted successfully'); }
    catch (e) { if (e.response?.status !== 404) showToast(e.response?.data?.message || 'Delete failed'); }
    finally { setDeleteSlug(null); setIsDeleting(false); fetchGames(); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {toast && (
        <div className="toast-notification show">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span>{toast}</span>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 animate-in">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-emerald-600 rounded-full"></div>
          <h3 className="text-xl font-bold text-slate-900 m-0">My Games</h3>
        </div>
        <Link to="/manage/create" className="btn-premium">+ Add Game</Link>
      </div>

      {loading ? <TableSkeleton /> : games.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 animate-in animate-in-delay-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-4 opacity-50">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <h4 className="font-bold text-slate-900 mb-2">No Games Yet</h4>
          <p className="text-slate-400 text-sm max-w-sm">Start your journey as a game developer. Create and upload your first browser game.</p>
          <Link to="/manage/create" className="btn-premium mt-4">Create Your First Game</Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-in animate-in-delay-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f8fffe] border-b-2 border-slate-200">
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[60px]">Thumb</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Description</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[200px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map(g => (
                  <tr key={g.slug} className="border-b border-slate-100 transition-colors hover:bg-teal-600/5">
                    <td className="px-4 py-3.5">
                      <img src={g.thumbnail ? `${backendUrl}${g.thumbnail}` : '/default-thumbnail.png'} alt={g.title}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-50"
                        onError={(e) => { e.target.src = '/default-thumbnail.png'; }}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <strong className="text-slate-900">{g.title}</strong>
                      <div className="md:hidden text-xs text-slate-400">{g.description?.substring(0, 50)}...</div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-slate-600 text-sm">
                      {g.description?.substring(0, 80)}{g.description?.length > 80 ? '...' : ''}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 flex-wrap">
                        <Link to={`/games/${g.slug}`} className="btn-outline-glass text-xs">View</Link>
                        <Link to={`/manage/${g.slug}/edit`} className="btn-outline-glass text-xs">Edit</Link>
                        <button className="btn-outline-glass text-xs text-rose-500 border-rose-200" onClick={() => setDeleteSlug(g.slug)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteSlug && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center" onClick={() => setDeleteSlug(null)}>
          <div className="animate-in bg-white/95 backdrop-blur-xl rounded-2xl p-9 max-w-[420px] w-[90%] shadow-xl text-center border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-bold mb-2 text-slate-900">Delete Game</h4>
            <p className="text-slate-600 mb-7 text-sm leading-relaxed">
              Are you sure you want to delete <strong>"{deleteSlug}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button className="btn-ghost px-7 py-2.5" onClick={() => setDeleteSlug(null)} disabled={isDeleting}>Cancel</button>
              <button className="btn-danger-glow px-7 py-2.5" onClick={executeDelete} disabled={isDeleting}>
                {isDeleting ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>Deleting...</>) : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
