export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-in">
      <div className="w-11 h-11 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 text-sm font-medium">{message}</p>
    </div>
  );
}
