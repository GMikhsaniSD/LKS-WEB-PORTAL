import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import GameCard from '../components/GameCard';
import { getRelativeTime } from '../utils/timeFormat';

function ProfileSkeleton() {
  return (
    <div>
      <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 py-14 pb-9 text-center">
        <div className="skeleton w-22 h-22 rounded-full mx-auto mb-4"></div>
        <div className="skeleton w-[160px] h-6 mx-auto mb-2 rounded-lg"></div>
        <div className="skeleton w-[200px] h-3.5 mx-auto rounded-lg"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <div className="md:w-5/12"><div className="skeleton w-1/2 mb-4 h-5 rounded-lg"></div></div>
          <div className="md:w-7/12"><div className="skeleton w-1/2 mb-4 h-5 rounded-lg"></div></div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${username}`).then(res => {
      setProfile(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [username]);

  if (loading) return <ProfileSkeleton />;

  if (!profile) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-10">
      <div className="text-9xl font-black leading-none bg-gradient-to-b from-slate-200 to-slate-100 bg-clip-text text-transparent">404</div>
      <h2 className="font-bold text-slate-900 mb-2">Profile Not Found</h2>
      <p className="text-slate-400 max-w-[400px] mb-6">This user doesn't exist.</p>
      <Link to="/games" className="btn-premium">Back to Discover</Link>
    </div>
  );

  return (
    <div>
      <div className="text-center py-14 pb-9 bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 animate-in">
        <div className="max-w-7xl mx-auto px-4">
          <div className="w-22 h-22 rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center mx-auto mb-4 text-4xl font-extrabold text-white shadow-lg shadow-teal-600/30 border-4 border-white/80">
            {profile.username?.charAt(0).toUpperCase()}
          </div>
          <h2 className="font-extrabold mb-1 text-slate-900 text-3xl tracking-tight">{profile.username}</h2>
          <p className="text-slate-400 text-sm mb-0">
            Member since {profile.registeredTimestamp ? getRelativeTime(profile.registeredTimestamp) : 'Unknown'}
          </p>
          <div className="flex justify-center gap-3 mt-3">
            <div className="inline-flex items-center gap-2 bg-teal-600/7 border border-teal-600/15 rounded-full px-5 py-1.5 shadow-xs">
              <span className="font-bold text-base text-teal-600">{profile.authoredGames?.length || 0}</span>
              <span className="text-slate-600 text-sm">Games</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-teal-600/7 border border-teal-600/15 rounded-full px-5 py-1.5 shadow-xs">
              <span className="font-bold text-base text-teal-600">{profile.highscores?.length || 0}</span>
              <span className="text-slate-600 text-sm">Scores</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 justify-center">
          <div className="lg:w-5/12 animate-in animate-in-delay-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-emerald-600 rounded-full shadow-sm shadow-teal-600/20"></div>
              <h3 className="text-lg font-bold text-slate-900 m-0">Highscores</h3>
            </div>
            {profile.highscores && profile.highscores.length > 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <ul className="list-none p-0 m-0">
                  {profile.highscores.map((h, i) => (
                    <li key={i} className="flex items-center px-5 py-3 border-b border-slate-100 last:border-b-0 transition-all hover:bg-teal-600/5">
                      <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center font-bold text-xs mr-3.5 shrink-0 ${
                        i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-sm shadow-amber-400/40' :
                        i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                        i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                        'bg-slate-100 text-slate-400'
                      }`}>{i + 1}</div>
                      <Link to={`/games/${h.game.slug}`} className="flex-1 text-teal-600 font-medium text-sm no-underline hover:underline">{h.game.title}</Link>
                      <span className="font-bold text-teal-600 text-sm tabular-nums">{Number(parseFloat(h.score).toFixed(2))}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-10 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-3 opacity-50">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <h4 className="text-base font-semibold text-slate-900 mb-1">No Highscores</h4>
                <p className="text-sm text-slate-400 m-0">This user hasn't played any games yet.</p>
              </div>
            )}
          </div>

          <div className="lg:w-7/12 animate-in animate-in-delay-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-emerald-600 rounded-full shadow-sm shadow-teal-600/20"></div>
              <h3 className="text-lg font-bold text-slate-900 m-0">Authored Games</h3>
            </div>
            {profile.authoredGames && profile.authoredGames.length > 0 ? (
              <div className="flex flex-wrap -m-2">
                {profile.authoredGames.map(game => (
                  <GameCard key={game.slug} game={game} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-14 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-4 opacity-50">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                <h4 className="text-base font-semibold text-slate-900 mb-2">No Games Authored</h4>
                <p className="text-sm text-slate-400 max-w-[220px] mx-auto">This developer hasn't published any games yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8 animate-in animate-in-delay-3">
          <Link to="/games" className="btn-ghost">Back to Discover Games</Link>
        </div>
      </div>
    </div>
  );
}
