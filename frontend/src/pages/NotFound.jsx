import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function NotFound() {
  const { dark } = useTheme();
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="text-8xl mb-4 animate-float select-none">🔍</div>
        <h1 className="font-head text-7xl font-extrabold text-primary mb-2" style={{ textShadow: dark ? '0 0 40px rgba(40,116,240,0.4)' : 'none' }}>404</h1>
        <h2 className="font-head text-xl font-bold mb-3">Page not found</h2>
        <p className="text-ink-400 dark:text-dm-muted text-sm leading-relaxed mb-8">
          Looks like this page packed up and moved out. Let's get you back to somewhere familiar.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/"         className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-200 shadow-sm">Go Home</Link>
          <Link to="/products" className={`px-5 py-2.5 rounded-xl text-sm font-bold border hover:-translate-y-0.5 transition-all duration-200 ${dark ? 'border-dm-border text-dm-muted hover:bg-dm-card' : 'border-ink-200 text-ink-700 hover:bg-ink-50'}`}>Browse Products</Link>
        </div>
      </div>
    </div>
  );
}
