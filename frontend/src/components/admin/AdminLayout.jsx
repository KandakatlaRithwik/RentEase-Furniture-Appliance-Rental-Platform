import { useState, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth }  from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/admin',          label: 'Dashboard',  icon: '📊', end: true },
  { to: '/admin/products', label: 'Products',   icon: '📦' },
  { to: '/admin/orders',   label: 'Orders',     icon: '🧾' },
  { to: '/admin/users',    label: 'Users',      icon: '👥' },
  { to: '/admin/maintenance', label: 'Maintenance', icon: '🔧' },
  { to: '/admin/returns',     label: 'Returns',     icon: '🚚' },
  { to: '/admin/profile',     label: 'Profile',     icon: '⚙️' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const handleNotificationToggle = () => {
    setShowNotifications((prev) => !prev);
  };

  const primaryBlue = '#2874F0';
  const accentOrange = '#FB641B';
  const bg   = dark ? '#050608' : '#F8FAFC';
  const side  = dark ? '#090B10' : '#FFFFFF';
  const border= dark ? '#23272F' : '#E2E8F0';
  const text  = dark ? '#F5F5F7' : '#111827';
  const muted = dark ? '#95A0B3' : '#667085';

  const linkCls = ({ isActive }) => {
    if (isActive) {
      return `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 mx-2 text-white shadow-sm ${dark ? 'bg-[#FB641B]' : 'bg-[#2874F0]'}`;
    }
    return `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 mx-2 ${dark ? 'text-[#A8B3C7] hover:bg-[#1D2630] hover:text-[#FB641B]' : 'text-[#6B6F80] hover:bg-[#EFF6FF] hover:text-[#2874F0]'}`;
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bg, color: text }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-60 border-r transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: side, borderColor: border, minHeight: '100vh' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: border }}>
          <span className="text-2xl">🏠</span>
          <div>
            <p className="font-head font-extrabold text-base leading-none" style={{ color: primaryBlue }}>RentEase</p>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: muted }}>Admin Panel</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={linkCls}
              style={({ isActive }) => isActive ? { background: dark ? accentOrange : primaryBlue } : { color: muted }}>
              <span className="text-lg w-6 text-center">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="p-4 border-t space-y-2" style={{ borderColor: border }}>
          {/* Admin info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: dark ? '#21262D' : '#F0F1F5' }}>
            <span className="w-8 h-8 rounded-full text-white font-bold text-sm flex-shrink-0 flex items-center justify-center" style={{ background: primaryBlue }}>
              {user?.name?.[0]?.toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{user?.name}</p>
              <p className="text-[10px] truncate" style={{ color: muted }}>{user?.email}</p>
            </div>
          </div>

          {/* Logout */}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{ color: '#EF4444' }}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center justify-between px-6 h-16 border-b flex-shrink-0"
          style={{ background: side, borderColor: border }}>
          <div className="flex items-center gap-4">
            {/* Hamburger (mobile) */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors" style={{ color: muted }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            </button>
            <div>
              <p className="font-head font-bold text-base">Admin Dashboard</p>
              <p className="text-xs" style={{ color: muted }}>Manage your RentEase platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications dropdown */}
            <div className="relative">
              <button 
                onClick={handleNotificationToggle}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors relative hover:opacity-80"
                style={{ color: muted }}>
                🔔
                {notifications.filter((notif) => !notif.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full" style={{ background: accentOrange }} />
                )}
              </button>
              
              {/* Notifications popup */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-lg border z-50"
                  style={{ background: side, borderColor: border }}>
                  <div className="p-3 border-b font-bold text-sm" style={{ borderColor: border }}>
                    Recent Notifications {notifications.length > 0 && `(${notifications.length})`}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs" style={{ color: muted }}>No notifications</div>
                    ) : (
                      notifications.map(notif => {
                        const getIcon = (type) => {
                          switch (type) {
                            case 'order': return '🛒';
                            case 'order_status': return '✅';
                            case 'maintenance': return '🔧';
                            case 'maintenance_status': return '✅';
                            case 'return': return '📦';
                            default: return '🔔';
                          }
                        };

                        const getTargetRoute = (type) => {
                          switch (type) {
                            case 'maintenance':
                            case 'maintenance_status':
                              return '/admin/maintenance';
                            case 'return':
                              return '/admin/returns';
                            default:
                              return '/admin/orders';
                          }
                        };

                        return (
                          <div key={notif.id} className="p-3 border-b text-xs hover:opacity-80 transition-opacity cursor-pointer"
                            style={{ borderColor: border }}
                            onClick={async () => { 
                              await markAsRead(notif.id);
                              navigate(getTargetRoute(notif.type)); 
                              setShowNotifications(false); 
                            }}>
                            <p className="font-medium">{getIcon(notif.type)} {notif.message}</p>
                            <p style={{ color: muted }}>{new Date(notif.createdAt).toLocaleString()}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button onClick={toggle}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors hover:opacity-80"
              style={{ color: muted }}
              title={dark ? 'Light Mode' : 'Dark Mode'}>
              {dark ? '☀️' : '🌙'}
            </button>

            {/* View user site */}
            <a href="/" target="_blank" rel="noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 hover:opacity-80"
              style={{ borderColor: border, color: muted }}>
              <span>↗</span> View Site
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
