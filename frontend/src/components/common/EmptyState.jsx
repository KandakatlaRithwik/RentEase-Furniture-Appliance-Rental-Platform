import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function EmptyState({ icon='📭', title, message, actionLabel, actionTo, onAction }) {
  const { dark } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-head text-lg font-bold mb-1">{title}</h3>
      <p className={`text-sm mb-6 max-w-xs ${dark ? 'text-dm-muted' : 'text-ink-400'}`}>{message}</p>
      {actionTo && (
        <Link to={actionTo} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-200">
          {actionLabel}
        </Link>
      )}
      {onAction && !actionTo && (
        <button onClick={onAction} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-200">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
