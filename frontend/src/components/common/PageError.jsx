import { useTheme } from '../../context/ThemeContext';

export default function PageError({ message = 'Failed to load data.', onRetry }) {
  const { dark } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="font-head text-lg font-bold mb-1">Couldn't load this page</h3>
      <p className={`text-sm mb-5 max-w-xs ${dark ? 'text-dm-muted' : 'text-ink-400'}`}>{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-200">
          Try Again
        </button>
      )}
    </div>
  );
}
