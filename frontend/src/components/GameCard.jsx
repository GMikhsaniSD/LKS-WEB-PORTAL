import { Link } from 'react-router-dom';
import { getRelativeTime } from '../utils/timeFormat';

export default function GameCard({ game }) {
  const backendUrl = import.meta.env.VITE_API_URL.includes('http') 
    ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
    : '/serve-game-files';

  return (
    <div className="w-full sm:w-1/2 lg:w-1/3 p-2">
      <Link to={`/games/${game.slug}`} className="block h-full" aria-label={`Play ${game.title}`}>
        <div className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-xl hover:shadow-teal-600/10 hover:border-teal-600/15 h-full">
          {/* Thumbnail */}
          <div className="relative bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-5 min-h-[180px] overflow-hidden">
            <img
              src={game.thumbnail ? `${backendUrl}${game.thumbnail}` : '/default-thumbnail.png'}
              alt={game.title}
              className="rounded-xl object-cover max-h-[140px] w-full transition-transform duration-400 group-hover:scale-105"
              onError={(e) => { e.target.src = '/default-thumbnail.png'; }}
            />
            <div className="absolute top-3 right-3">
              <span className="bg-white/90 backdrop-blur-sm text-teal-600 font-bold text-xs px-3 py-1 rounded-full border border-teal-600/10 shadow-sm">
                {game.scoreCount} plays
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col h-full">
            <h5 className="font-bold text-slate-900 mb-1 leading-tight tracking-tight">{game.title}</h5>
            <p className="text-sm text-slate-400 mb-0">
              by <span className="text-teal-600 font-semibold">{game.author}</span>
            </p>
            <p className="text-sm text-slate-600 mt-2.5 line-clamp-2 leading-relaxed flex-grow">{game.description}</p>
            {game.uploadTimestamp && (
              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">{getRelativeTime(game.uploadTimestamp)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
