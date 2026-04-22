import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function FormSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 p-10 mt-5">
            <div className="skeleton w-[180px] h-7 mx-auto mb-2 rounded-lg"></div>
            <div className="skeleton w-[220px] h-3.5 mx-auto mb-8 rounded-lg"></div>
            <div className="skeleton w-full h-11 mb-4 rounded-xl"></div>
            <div className="skeleton w-full h-20 mb-4 rounded-xl"></div>
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

export default function ManageGameUpdate() {
  const { slug } = useParams();
  const { username } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zipFile, setZipFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Cek apakah user ini author-nya
    api.get(`/games/${slug}`).then(res => {
      if (res.data.author !== username) { navigate(`/games/${slug}`); return; }
      setTitle(res.data.title); setDescription(res.data.description); setLoading(false);
    }).catch(() => navigate('/manage'));
  }, [slug, username, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); setServerError(''); setSubmitting(true);
    try {
      await api.put(`/games/${slug}`, { title, description });
      // Upload file ZIP kalau ada
      if (zipFile) {
        const formData = new FormData();
        formData.append('zipfile', zipFile);
        formData.append('token', localStorage.getItem('token'));
        await api.post(`/games/${slug}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: undefined } });
      }
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append('thumbnail', thumbnailFile);
        formData.append('token', localStorage.getItem('token'));
        await api.post(`/games/${slug}/thumbnail`, formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: undefined } });
      }
      navigate('/manage');
    } catch (err) {
      if (err.response?.data?.violations) {
        const v = {};
        for (const key in err.response.data.violations) { v[key] = err.response.data.violations[key].message; }
        setErrors(v);
      } else {
        const errorMsg = typeof err.response?.data === 'string' ? err.response.data : err.response?.data?.message || 'Error updating game';
        setServerError(errorMsg);
      }
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
                <h3 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>Update Game</h3>
                <p className="text-slate-400 text-sm">Edit details or upload a new version</p>
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2 mb-4">{serverError}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1.5">Title</label>
                  <input className="w-full bg-white border-[1.5px] border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-teal-600 focus:ring-3 focus:ring-teal-600/10 focus:outline-none transition-all"
                    value={title} onChange={e => setTitle(e.target.value)} disabled={submitting}
                  />
                  {errors.title && <small className="block mt-2 text-red-500 font-semibold text-xs">{errors.title}</small>}
                </div>
                <div className="mb-4">
                  <label className="block text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1.5">Description</label>
                  <textarea className="w-full bg-white border-[1.5px] border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-teal-600 focus:ring-3 focus:ring-teal-600/10 focus:outline-none transition-all resize-y"
                    rows={3} value={description} onChange={e => setDescription(e.target.value)} disabled={submitting}
                  />
                  {errors.description && <small className="block mt-2 text-red-500 font-semibold text-xs">{errors.description}</small>}
                </div>
                <div className="mb-4">
                  <label className="block text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1.5">Game Thumbnail (Image)</label>
                  <input className="w-full bg-white border-[1.5px] border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm file:bg-gradient-to-br file:from-teal-600 file:to-emerald-600 file:text-white file:border-none file:rounded-lg file:px-4 file:py-1.5 file:font-semibold file:text-xs file:mr-3 file:cursor-pointer"
                    type="file" accept="image/png, image/jpeg, image/jpg" onChange={e => setThumbnailFile(e.target.files[0])} disabled={submitting}
                  />
                  <small className="block mt-1 text-slate-400 text-xs">Optional: Select custom thumbnail to override game file</small>
                </div>
                <div className="mb-5">
                  <label className="block text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1.5">Upload New Version (ZIP)</label>
                  <input className="w-full bg-white border-[1.5px] border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm file:bg-gradient-to-br file:from-teal-600 file:to-emerald-600 file:text-white file:border-none file:rounded-lg file:px-4 file:py-1.5 file:font-semibold file:text-xs file:mr-3 file:cursor-pointer"
                    type="file" accept=".zip" onChange={e => setZipFile(e.target.files[0])} disabled={submitting}
                  />
                  <small className="block mt-1 text-slate-400 text-xs">Select a ZIP file only if you want to upload a new version</small>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-premium flex-1 py-3" disabled={submitting}>
                    {submitting ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>Updating...</>) : 'Update Game'}
                  </button>
                  <Link to="/manage" className={`btn-ghost py-3 px-5 ${submitting ? 'pointer-events-none' : ''}`}>Back</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
