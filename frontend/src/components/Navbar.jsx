import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { token, isAdmin, username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 992) setMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/'); };

  if (!token) return null;

  const isActive = (path) => {
    if (path === '/admin/users') return location.pathname.startsWith('/admin/users');
    return location.pathname === path;
  };

  const linkClass = (path) =>
    `px-4 py-2 rounded-xl text-sm font-medium transition-all ${
      isActive(path)
        ? 'bg-teal-600/10 text-teal-600 font-semibold'
        : 'text-slate-600 hover:text-teal-600 hover:bg-teal-600/5'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-black/5 shadow-xs py-3">
      <div className="max-w-7xl mx-auto px-4 flex items-center flex-wrap relative">
        <Link
          className="font-extrabold text-xl tracking-tight text-slate-900"
          to={isAdmin ? '/admin' : '/games'}
          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
        >
          {isAdmin ? 'Admin' : 'Portal'}<span className="bg-gradient-to-br from-teal-600 to-emerald-600 bg-clip-text text-transparent">{isAdmin ? 'Portal' : 'Game'}</span>
        </Link>

        {/* Mobile toggler */}
        <button
          className="lg:hidden ml-auto p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            ) : (
              <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            )}
          </svg>
        </button>

        {/* Nav content */}
        <div className={`${menuOpen ? 'flex flex-col w-full mt-3 p-4 bg-white/90 backdrop-blur-xl rounded-xl border border-slate-200 shadow-lg gap-2' : 'hidden'} lg:flex lg:flex-row lg:items-center lg:flex-1 lg:w-auto lg:mt-0 lg:p-0 lg:bg-transparent lg:border-none lg:shadow-none lg:gap-0 lg:justify-end`}>
          <div className="flex flex-col lg:flex-row lg:absolute lg:left-1/2 lg:-translate-x-1/2 gap-4">
            {isAdmin ? (
              <>
                <Link className={linkClass('/admin/admins')} to="/admin/admins">Administrators</Link>
                <Link className={linkClass('/admin/users')} to="/admin/users">Users</Link>
              </>
            ) : (
              <>
                <Link className={linkClass('/games')} to="/games">Discover</Link>
                {localStorage.getItem('role') === 'dev' && (
                  <Link className={linkClass('/manage')} to="/manage">Manage Games</Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3 lg:mt-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <Link
              to={isAdmin ? '/admin' : `/profile/${username}`}
              className="flex items-center gap-2 py-1 pl-1 pr-3 bg-teal-600/7 border border-teal-600/15 rounded-full hover:bg-teal-600/12 hover:-translate-y-0.5 hover:shadow-md hover:shadow-teal-600/10 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center font-bold text-[11px] text-white shadow-sm shadow-teal-600/30">
                {username?.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-sm text-slate-900">{username}</span>
            </Link>

            <button className="btn-ghost px-3 py-1.5 text-xs" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
