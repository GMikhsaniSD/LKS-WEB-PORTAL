import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import GameCard from '../components/GameCard';

function SkeletonCard() {
  return (
    <div className="w-full sm:w-1/2 lg:w-1/3 p-2">
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
        <div className="h-[180px] skeleton"></div>
        <div className="p-5">
          <div className="skeleton w-3/4 h-4 rounded-lg mb-2"></div>
          <div className="skeleton w-1/2 h-3 rounded-lg mb-3"></div>
          <div className="skeleton w-full h-3 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverGames() {
  const [games, setGames] = useState([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [sortBy, setSortBy] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  const sentinelRef = useRef();

  const fetchGames = async (p, reset = false) => {
    setLoading(true);
    try {
      const res = await api.get(`/games?page=${p}&size=9&sortBy=${sortBy}&sortDir=${sortDir}`);
      setTotalElements(res.data.totalElements);
      setGames(prev => reset ? res.data.content : [...prev, ...res.data.content]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setInitialLoad(false); }
  };

  useEffect(() => {
    setGames([]); setPage(0); setInitialLoad(true);
    fetchGames(0, true);
  }, [sortBy, sortDir]);

  const hasMore = games.length < totalElements;

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage(prev => { const next = prev + 1; fetchGames(next); return next; });
      }
    });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  const sortOptions = [
    { value: 'popular', label: 'Popular' },
    { value: 'uploaddate', label: 'Recent' },
    { value: 'title', label: 'Alphabetical' },
  ];

  const pillClass = (active) =>
    `px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all shadow-xs ${
      active
        ? 'bg-gradient-to-br from-teal-600 to-emerald-600 text-white border-transparent shadow-md shadow-teal-600/25 -translate-y-0.5'
        : 'bg-white border border-slate-200 text-slate-600 hover:bg-teal-600/5 hover:text-teal-600 hover:border-teal-600/15 hover:-translate-y-0.5'
    }`;

  return (
    <div>
      <div className="relative py-16 pb-10 text-center bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 animate-in">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-3 tracking-tight leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
            Discover <span className="bg-gradient-to-br from-teal-600 to-emerald-600 bg-clip-text text-transparent">Games</span>
          </h1>
          <p className="text-base text-slate-400 max-w-[480px] mx-auto leading-relaxed">
            Explore, play, and compete in browser-based games from talented developers worldwide.
          </p>
          <div className="inline-flex items-center gap-2 bg-teal-600/7 border border-teal-600/15 rounded-full px-5 py-2 mt-5 shadow-xs">
            <span className="font-bold text-lg text-teal-600">{totalElements}</span>
            <span className="text-slate-600 text-sm">Games Available</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-center gap-2 mb-6 animate-in animate-in-delay-1">
          {sortOptions.map(opt => (
            <button key={opt.value} className={pillClass(sortBy === opt.value)} onClick={() => setSortBy(opt.value)}>
              {opt.label}
            </button>
          ))}
          <div className="w-px h-8 bg-slate-200 mx-2 self-center"></div>
          <button className={pillClass(sortDir === 'asc')} onClick={() => setSortDir('asc')}>ASC</button>
          <button className={pillClass(sortDir === 'desc')} onClick={() => setSortDir('desc')}>DESC</button>
        </div>

        {initialLoad && (
          <div className="flex flex-wrap -m-2">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {!initialLoad && (
          <div className="flex flex-wrap -m-2 animate-in animate-in-delay-2">
            {games.map((g, i) => <GameCard key={`${g.slug}-${i}`} game={g} />)}
          </div>
        )}

        {loading && !initialLoad && (
          <div className="text-center py-6">
            <span className="w-4 h-4 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin inline-block mr-2"></span>
            <span className="text-slate-400 text-sm">Loading more games...</span>
          </div>
        )}

        {!loading && games.length > 0 && !hasMore && (
          <div className="text-center py-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            <span className="relative bg-white px-4 text-sm text-slate-400 font-medium">You've discovered all {totalElements} games!</span>
          </div>
        )}

        {!loading && !initialLoad && games.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-16 animate-in">
            <h4 className="font-bold text-slate-900 mb-2">No games yet</h4>
            <p className="text-slate-400 text-sm">Be the first to upload a game and share it with the world!</p>
          </div>
        )}

        <div ref={sentinelRef} className="h-px"></div>
      </div>
    </div>
  );
}
