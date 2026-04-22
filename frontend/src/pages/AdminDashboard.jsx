import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { username } = useAuth();

  return (
    <div>
      <div className="relative py-12 pb-9 text-center bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 animate-in">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-2">Administrator Dashboard</p>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
            Welcome, <span className="bg-gradient-to-br from-teal-600 to-emerald-600 bg-clip-text text-transparent">{username}</span>!
          </h1>
          <p className="text-base text-slate-400 max-w-[480px] mx-auto leading-relaxed">
            Manage your gaming portal from here. Monitor users, administrators, and platform activity.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <div className="md:w-5/12 animate-in animate-in-delay-1">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center transition-all duration-400 hover:-translate-y-1.5 hover:scale-[1.01] hover:border-teal-600/15 hover:shadow-xl hover:shadow-teal-600/10 relative overflow-hidden h-full shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 transition-opacity hover:opacity-100"></div>
              <div className="w-16 h-16 rounded-2xl bg-teal-600/7 text-teal-600 flex items-center justify-center mx-auto mb-4 text-2xl font-extrabold transition-transform hover:scale-110">A</div>
              <h4 className="font-bold text-slate-900 mb-2 tracking-tight">Admin Management</h4>
              <p className="text-slate-600 text-sm leading-relaxed">View portal administrators and their access activity.</p>
              <Link to="/admin/admins" className="btn-premium w-full mt-4 text-center">Access Module</Link>
            </div>
          </div>

          <div className="md:w-5/12 animate-in animate-in-delay-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center transition-all duration-400 hover:-translate-y-1.5 hover:scale-[1.01] hover:border-teal-600/15 hover:shadow-xl hover:shadow-teal-600/10 relative overflow-hidden h-full shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/8 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-extrabold transition-transform hover:scale-110">U</div>
              <h4 className="font-bold text-slate-900 mb-2 tracking-tight">User Control</h4>
              <p className="text-slate-600 text-sm leading-relaxed">Manage accounts, block malicious users, and oversee players.</p>
              <Link to="/admin/users" className="btn-success-glow w-full mt-4 text-center">Access Module</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
