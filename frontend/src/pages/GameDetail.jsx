import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ScoreTable from '../components/ScoreTable';
import { getRelativeTime } from '../utils/timeFormat';

function GameDetailSkeleton() {
  return (
    <div>
      <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 py-14 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="skeleton w-[280px] h-8 mx-auto mb-3 rounded-lg"></div>
          <div className="skeleton w-[160px] h-5 mx-auto mb-3 rounded-lg"></div>
          <div className="skeleton w-[400px] h-4 mx-auto rounded-lg"></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <div className="md:w-5/12">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-3 mb-3">
                  <div className="skeleton w-[30px] h-[30px] rounded-full"></div>
                  <div className="skeleton flex-1 h-3.5 rounded-lg"></div>
                  <div className="skeleton w-[50px] h-3.5 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-5/12"><div className="skeleton h-[280px] rounded-2xl"></div></div>
        </div>
      </div>
    </div>
  );
}

export default function GameDetail() {
  const { slug } = useParams();
  const { username, token } = useAuth();
  const [game, setGame] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoreMsg, setScoreMsg] = useState('');
  const backendUrl = import.meta.env.VITE_API_URL.includes('http') 
    ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
    : '/serve-game-files';

  const fetchScores = useCallback(async () => {
    try { const res = await api.get(`/games/${slug}/scores`); setScores(res.data.scores || []); }
    catch (e) { console.error(e); }
  }, [slug]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gameRes, scoreRes] = await Promise.all([api.get(`/games/${slug}`), api.get(`/games/${slug}/scores`)]);
        setGame(gameRes.data); setScores(scoreRes.data.scores || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [slug]);

  const isProcessingScore = useRef(false);
  const toastTimeoutRef = useRef(null);
  const requestTimes = useRef([]);
  const isPenaltyActive = useRef(false);

  useEffect(() => {
    if (!token || !slug) return;
    // Listen skor dari iframe game via postMessage
    const handleMessage = async (event) => {
      const data = event.data;
      if (data && data.event_type === 'game_run_end' && data.score !== undefined) {
        
        // Sedang dihukum karena spam? Refresh waktu hukuman lalu abaikan
        if (isPenaltyActive.current) {
          setScoreMsg('Too many requests! Penalty active, please wait.');
          if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
          toastTimeoutRef.current = setTimeout(() => {
            setScoreMsg('');
            isPenaltyActive.current = false;
            requestTimes.current = []; // Riset riwayat klik
          }, 5000);
          return;
        }

        const now = Date.now();
        // Hanya simpan history klik dalam 2 detik terakhir
        requestTimes.current = requestTimes.current.filter(t => now - t < 2000);
        
        // Deteksi Autoclicker/Spam: lebih dari 8 klik dalam 2 detik
        const isSpamTriggered = requestTimes.current.length >= 8;
        
        if (isSpamTriggered) {
          isPenaltyActive.current = true;
          setScoreMsg('Too many requests! Penalty active, please wait.');
          if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
          toastTimeoutRef.current = setTimeout(() => {
            setScoreMsg('');
            isPenaltyActive.current = false;
            requestTimes.current = []; // Riset riwayat klik
          }, 5000);
          // Jangan di-return! Biarkan skornya (yang masuk di ujung waktu) tetap tersimpan ke server
        }

        requestTimes.current.push(now);

        if (isProcessingScore.current) return;
        
        isProcessingScore.current = true;

        try {
          await api.post(`/games/${slug}/scores`, { score: data.score });
          // Hanya timpa pesan dengan 'Score submitted' jika tidak ada peringatan spam yang aktif
          if (!isPenaltyActive.current) {
            setScoreMsg(`Score ${parseFloat(data.score).toFixed(2)} submitted!`);
          }
          await fetchScores();
        } catch { 
           if (!isPenaltyActive.current) setScoreMsg('Failed to submit score'); 
        } finally {
          isProcessingScore.current = false;
          // Hanya riset timer jika tidak sedang masa penalti, 
          // karena timer penalti (5000ms) diatur di atas secara independen
          if (!isPenaltyActive.current) {
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
            toastTimeoutRef.current = setTimeout(() => setScoreMsg(''), 5000);
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [token, slug, fetchScores]);

  if (loading) return <GameDetailSkeleton />;

  if (!game) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-10">
      <div className="text-9xl font-black leading-none bg-gradient-to-b from-slate-200 to-slate-100 bg-clip-text text-transparent">404</div>
      <h2 className="font-bold text-slate-900 mb-2">Game Not Found</h2>
      <p className="text-slate-400 max-w-[400px] mb-6">The game you're looking for doesn't exist or has been removed.</p>
      <Link to="/games" className="btn-premium">Back to Discover Games</Link>
    </div>
  );

  return (
    <div>
      <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 border-b border-slate-200 py-13 text-center animate-in">
        <div className="max-w-7xl mx-auto px-4 relative">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>{game.title}</h2>
          <div className="flex justify-center items-center gap-3 mb-3 flex-wrap">
            <Link to={`/profile/${game.author}`} className="btn-success-glow text-sm px-5 py-1.5">{game.author}</Link>
            {game.uploadTimestamp && <span className="text-sm text-slate-400">Updated {getRelativeTime(game.uploadTimestamp)}</span>}
          </div>
          <p className="text-slate-600 text-sm max-w-[600px] mx-auto">{game.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {scoreMsg && (
          <div className="toast-notification show">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>{scoreMsg}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <div className="md:w-5/12 animate-in">
            <ScoreTable scores={scores} currentUsername={username} />
          </div>
          <div className="md:w-5/12 animate-in animate-in-delay-1">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <img src={game.thumbnail ? `${backendUrl}${game.thumbnail}` : '/default-thumbnail.png'}
                alt={game.title} className="w-full block object-cover max-h-80"
                onError={(e) => { e.target.src = '/default-thumbnail.png'; }}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Link to="/games" className="btn-ghost flex-1 text-center py-2.5 text-sm">Back to Games</Link>
            </div>
          </div>
        </div>

        {game.gamePath && (
          <div className="flex justify-center mt-6 animate-in animate-in-delay-2">
            <div className="w-full max-w-5xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-emerald-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-slate-900 m-0">Play Now</h3>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
                <iframe src={`/serve-game-files${game.gamePath}`}
                  className="w-full h-[600px] border-none block" title={game.title}
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
