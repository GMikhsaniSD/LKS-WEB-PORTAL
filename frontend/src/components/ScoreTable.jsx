import React from 'react';

export default function ScoreTable({ scores, currentUsername }) {
  const top10 = scores.slice(0, 10);
  const userInTop10 = top10.some(s => s.username === currentUsername);
  const userScore = scores.find(s => s.username === currentUsername);

  const getRankStyle = (i) => {
    if (i === 0) return 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-sm shadow-amber-400/40';
    if (i === 1) return 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-sm shadow-slate-400/30';
    if (i === 2) return 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-sm shadow-amber-700/30';
    return 'bg-slate-100 text-slate-400';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5 bg-[#f8fffe]">
        <h5 className="m-0 font-bold text-slate-900 text-base tracking-tight">Leaderboard</h5>
        {top10.length > 0 && (
          <span className="ml-auto bg-teal-600/7 text-teal-600 font-semibold text-xs px-3.5 py-1 rounded-full border border-teal-600/15">
            {scores.length} players
          </span>
        )}
      </div>

      {top10.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-14">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-4 opacity-50">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
          <h4 className="text-base font-semibold text-slate-900 mb-2">No scores yet</h4>
          <p className="text-sm text-slate-400 max-w-[220px] mx-auto">Be the first to play and claim the top leaderboard spot!</p>
        </div>
      ) : (
        <ul className="list-none p-0 m-0">
          {top10.map((s, i) => (
            <li key={i} className="flex items-center px-5 py-3 border-b border-slate-100 last:border-b-0 transition-all hover:bg-teal-600/5 hover:pl-6.5">
              <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center font-bold text-xs mr-3.5 shrink-0 transition-transform hover:scale-110 ${getRankStyle(i)}`}>
                {i + 1}
              </div>
              <span className={`flex-1 text-sm ${s.username === currentUsername ? 'text-teal-600 font-bold' : 'text-slate-900 font-medium'}`}>
                {s.username}
                {s.username === currentUsername && <span className="text-xs opacity-70 ml-1.5">(You)</span>}
              </span>
              <span className="font-bold text-teal-600 text-sm tabular-nums">{Number(parseFloat(s.score).toFixed(2))}</span>
            </li>
          ))}
        </ul>
      )}

      {!userInTop10 && userScore && (
        <div className="px-5 py-3.5 bg-teal-600/5 border-t border-teal-600/15 flex items-center">
          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-bold text-xs mr-3.5 bg-teal-600/7 text-teal-600 border border-teal-600/15">—</div>
          <span className="flex-1 text-teal-600 font-bold text-sm">
            {userScore.username} <span className="text-xs opacity-70">(You)</span>
          </span>
          <span className="font-bold text-teal-600 text-sm tabular-nums">{Number(parseFloat(userScore.score).toFixed(2))}</span>
        </div>
      )}
    </div>
  );
}
