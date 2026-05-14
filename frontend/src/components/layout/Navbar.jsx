import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }  from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../common/NotificationBell';

const CATS = [
  { label: 'All',              path: '/products' },
  { label: 'Beds',             path: '/products?subCategory=bed' },
  { label: 'Sofas',            path: '/products?subCategory=sofa' },
  { label: 'Tables',           path: '/products?subCategory=table' },
  { label: 'Wardrobes',        path: '/products?subCategory=wardrobe' },
  { label: 'Fridges',          path: '/products?subCategory=fridge' },
  { label: 'Washing Machines', path: '/products?subCategory=washing_machine' },
  { label: 'TVs',              path: '/products?subCategory=tv' },
  { label: 'ACs',              path: '/products?subCategory=ac' },
];

export default function Navbar() {
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const { dark, toggle } = useTheme();
  const [search,     setSearch]     = useState('');
  const [dropOpen,   setDropOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const dropRef   = useRef(null);

  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/products?search=${encodeURIComponent(search.trim())}`); setMobileOpen(false); }
  };

  const navLinkCls = (to) =>
    `text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200
    ${location.pathname === to ? 'bg-white/25 text-white' : 'text-white/85 hover:bg-white/18 hover:text-white'}`;

  return (
    <header className="sticky top-0 z-50" style={{ background: dark ? '#0D1117' : '#2874F0', boxShadow: dark ? '0 2px 16px rgba(0,0,0,0.6)' : '0 2px 12px rgba(40,116,240,0.35)' }}>

      {/* Main bar */}
      <div className="max-w-screen-xl mx-auto px-4 flex items-center gap-3 h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <span className="text-2xl">🏠</span>
          <div className="leading-tight">
            <span className="font-head font-extrabold text-white text-lg block leading-none tracking-tight">RentEase</span>
            <span className="text-white/65 text-[10px] italic">Furniture & Appliances</span>
          </div>
        </Link>

        {/* Search — desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl rounded-xl overflow-hidden shadow-md border border-white/10">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search furniture, appliances..."
            className="flex-1 px-4 py-2.5 text-sm text-ink-800 placeholder-ink-400 outline-none bg-white" />
          <button type="submit" className="px-4 bg-accent hover:bg-accent-dark transition-colors flex items-center">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
        </form>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-auto flex-shrink-0">
          <Link to="/products" className={navLinkCls('/products')}>Browse</Link>

          {isLoggedIn ? (
            <>
              {/* Notification Bell - only show for logged in users */}
              <NotificationBell />

              {isAdmin
                ? <a href="/admin" className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all duration-200">⚙️ Admin</a>
                : <Link to="/dashboard" className={navLinkCls('/dashboard')}>My Rentals</Link>
              }

              {/* User dropdown */}
              <div className="relative ml-1" ref={dropRef}>
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border border-white/10">
                  <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {user.name[0].toUpperCase()}
                  </span>
                  <span className="max-w-[76px] truncate">{user.name.split(' ')[0]}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {dropOpen && (
                  <div className={`absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-xl border overflow-hidden animate-slide-down z-50
                    ${dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100'}`}>
                    <div className={`px-4 py-3 ${dark ? 'bg-dm-hover' : 'bg-ink-50'}`}>
                      <p className="text-sm font-bold truncate">{user.name}</p>
                      <p className="text-xs text-ink-500 dark:text-dm-muted truncate">{user.email}</p>
                    </div>
                    <div className={`h-px ${dark ? 'bg-dm-border' : 'bg-ink-100'}`} />
                    {!isAdmin && (
                      <>
                        <Link to="/dashboard"   onClick={() => setDropOpen(false)} className={`block px-4 py-2.5 text-sm transition-colors hover:text-primary ${dark ? 'hover:bg-dm-hover' : 'hover:bg-ink-50'}`}>📦 My Rentals</Link>
                        <Link to="/maintenance" onClick={() => setDropOpen(false)} className={`block px-4 py-2.5 text-sm transition-colors hover:text-primary ${dark ? 'hover:bg-dm-hover' : 'hover:bg-ink-50'}`}>🔧 Maintenance</Link>
                      </>
                    )}
                    <div className={`h-px ${dark ? 'bg-dm-border' : 'bg-ink-100'}`} />
                    <button onClick={() => { logout(); navigate('/'); }}
                      className={`w-full text-left px-4 py-2.5 text-sm text-danger transition-colors ${dark ? 'hover:bg-red-950/40' : 'hover:bg-danger-light'}`}>
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login"    className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white border border-white/35 hover:bg-white/15 transition-all duration-200">Login</Link>
              <Link to="/register" className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-accent hover:bg-accent-dark text-white transition-all duration-200 shadow-sm">Sign Up</Link>
            </div>
          )}

          {/* ✅ Dark mode toggle */}
          <button onClick={toggle}
            className="ml-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border border-white/20 hover:bg-white/20"
            title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="text-lg" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.4))' }}>
              {dark ? '☀️' : '🌙'}
            </span>
          </button>
        </nav>

        {/* Hamburger */}
        <div className="md:hidden ml-auto flex items-center gap-2">
          <button onClick={toggle} className="w-8 h-8 rounded-lg flex items-center justify-center text-base border border-white/20 hover:bg-white/15 transition-colors">
            {dark ? '☀️' : '🌙'}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="flex flex-col gap-[5px] p-1.5">
            <span className={`block w-[22px] h-0.5 bg-white rounded transition-all duration-200 ${mobileOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block w-[22px] h-0.5 bg-white rounded transition-all duration-200 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-[22px] h-0.5 bg-white rounded transition-all duration-200 ${mobileOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className={`md:hidden border-t px-4 py-4 animate-slide-down space-y-3
          ${dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100'}`}>
          <form onSubmit={handleSearch} className="flex rounded-xl overflow-hidden border border-ink-200">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
              className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent" />
            <button type="submit" className="px-4 bg-accent text-white text-sm font-bold">Go</button>
          </form>
          <div className="space-y-0.5">
            <Link to="/products"    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${dark ? 'hover:bg-dm-hover' : 'hover:bg-ink-50'} hover:text-primary`}>🛍️ Browse</Link>
            {isLoggedIn ? (
              <>
                {isAdmin
                  ? <a href="/admin" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${dark ? 'hover:bg-dm-hover' : 'hover:bg-ink-50'} hover:text-primary`}>⚙️ Admin Panel</a>
                  : <>
                      <Link to="/dashboard"   className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${dark ? 'hover:bg-dm-hover' : 'hover:bg-ink-50'} hover:text-primary`}>📦 My Rentals</Link>
                      <Link to="/maintenance" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${dark ? 'hover:bg-dm-hover' : 'hover:bg-ink-50'} hover:text-primary`}>🔧 Maintenance</Link>
                    </>
                }
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mt-1 ${dark ? 'bg-dm-hover' : 'bg-ink-50'}`}>
                  <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">{user.name[0].toUpperCase()}</span>
                  <div><p className="text-sm font-bold">{user.name}</p><p className="text-xs text-ink-400">{user.email}</p></div>
                </div>
                <button onClick={() => { logout(); navigate('/'); }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger transition-colors ${dark ? 'hover:bg-red-950/40' : 'hover:bg-danger-light'}`}>
                  🚪 Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link to="/login"    className="flex-1 text-center py-2.5 border border-ink-200 rounded-xl text-sm font-semibold hover:bg-ink-50 transition-colors">Login</Link>
                <Link to="/register" className="flex-1 text-center py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category strip */}
      <div style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.18)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex gap-1 py-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {CATS.map((c) => (
              <Link key={c.label} to={c.path}
                className="px-3.5 py-1 rounded-full text-xs font-medium text-white/80 hover:bg-white/20 hover:text-white whitespace-nowrap transition-all duration-200 flex-shrink-0">
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
