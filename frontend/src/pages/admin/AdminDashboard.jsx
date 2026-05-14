import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,PieChart,Pie,Cell,Legend } from 'recharts';
import { adminAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import PageError from '../../components/common/PageError';

const PIE_COLORS = ['#2874F0','#26A541','#FB641B','#7C3AED','#0F9D8A','#FF4D4D','#C9CBD6'];
const STATUS_ORDER = ['pending','approved','delivered','active','returned','cancelled','closed'];
const ACCENT_ORANGE = '#FB641B';

function Kpi({ icon, label, value, color, bg }) {
  const { dark } = useTheme();
  return (
    <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${bg}`}
         style={{ boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div className="w-11 h-11 rounded-xl bg-white/30 flex items-center justify-center text-2xl flex-shrink-0">{icon}</div>
      <div>
        <p className={`font-head text-2xl font-extrabold leading-none ${color}`}>{value ?? '—'}</p>
        <p className="text-xs text-ink-500 dark:text-dm-muted mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, badge, children }) {
  const { dark } = useTheme();
  return (
    <div className={`rounded-2xl border p-6 transition-colors duration-300 ${dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100'}`}
         style={{ boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-head font-bold text-[15px]">{title}</h3>
        {badge && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent-light text-accent-dark">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const { dark } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [a, o] = await Promise.all([adminAPI.getAnalytics(), adminAPI.getAllOrders({ limit: 100 })]);
      setAnalytics(a.data.analytics);
      setOrders(o.data.orders || []);
    } catch (err) { setError(err?.response?.data?.message || 'Failed to load dashboard data.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const muted = dark ? '#8B949E' : '#6B6F80';
  const grid  = dark ? '#30363D' : '#F0F1F5';
  const tip   = { contentStyle: { borderRadius: 12, fontSize: 12, background: dark ? '#21262D' : '#fff', border: `1px solid ${grid}`, color: dark ? '#E6EDF3' : '#1E2035' } };

  const revenueByMonth = (() => {
    const map = {};
    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      const key = new Date(o.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      map[key] = (map[key] || 0) + (o.totalAmount || 0);
    });
    return Object.entries(map).slice(-6).map(([month, revenue]) => ({ month, revenue }));
  })();

  const ordersByStatus = STATUS_ORDER
    .map((s) => ({ name: s.charAt(0).toUpperCase() + s.slice(1), value: orders.filter((o) => o.status === s).length }))
    .filter((d) => d.value > 0);

  if (error) return <PageError message={error} onRetry={load} />;

  const KPIS = [
    { icon:'✅', label:'Active Rentals',   value: analytics?.activeRentals,   color:'text-success',  bg: dark ? 'bg-success/10 border-success/20' : 'bg-success-light border-success/10'  },
    { icon:'⏳', label:'Pending Orders',   value: analytics?.pendingOrders,   color:'text-accent',   bg: dark ? 'bg-accent/10 border-accent/20'   : 'bg-accent-light border-accent/10'    },
    { icon:'💰', label:'Monthly Revenue',  value: analytics?.monthlyRevenue != null ? `₹${analytics.monthlyRevenue.toLocaleString()}` : null, color:'text-purple', bg: dark ? 'bg-purple/10 border-purple/20' : 'bg-purple-light border-purple/10' },
    { icon:'📈', label:'MRR',              value: analytics?.mrr != null ? `₹${analytics.mrr.toLocaleString()}` : null, color:'text-accent', bg: dark ? 'bg-accent/10 border-accent/20' : 'bg-accent-light border-accent/10' },
    { icon:'👥', label:'Total Users',      value: analytics?.totalUsers,      color:'text-teal',     bg: dark ? 'bg-teal/10 border-teal/20'       : 'bg-teal-light border-teal/10'        },
    { icon:'📦', label:'Total Products',   value: analytics?.totalProducts,   color:'text-ink-700',  bg: dark ? 'bg-dm-hover border-dm-border'    : 'bg-ink-100 border-ink-200'           },
    { icon:'🔧', label:'Open Maintenance', value: analytics?.openMaintenance, color:'text-accent',   bg: dark ? 'bg-accent/10 border-accent/20'   : 'bg-accent-light border-accent/10'    },
    { icon:'🆕', label:'New This Month',   value: analytics?.newOrdersThisMonth, color:'text-success', bg: dark ? 'bg-success/10 border-success/20' : 'bg-success-light border-success/10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-head text-2xl font-bold">Overview</h1>
          <p className="text-sm text-ink-400 dark:text-dm-muted mt-0.5">Platform analytics at a glance</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/products" className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent-dark transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
            + Add Product
          </Link>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [...Array(8)].map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl" />) :
          KPIS.map((k) => <Kpi key={k.label} {...k} />)
        }
      </div>

      {/* Charts */}
      {!loading && (
        <div className="grid md:grid-cols-2 gap-5">
          <ChartCard title="Monthly Revenue" badge="Last 6 months">
            {revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={revenueByMonth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: muted }} />
                  <YAxis tick={{ fontSize: 11, fill: muted }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip {...tip} formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill={ACCENT_ORANGE} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-52 flex items-center justify-center text-ink-300 text-sm">No revenue data yet</div>}
          </ChartCard>

          <ChartCard title="Orders by Status" badge={`${orders.length} total`}>
            {ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {ordersByStatus.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tip} />
                  <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-52 flex items-center justify-center text-ink-300 text-sm">No orders yet</div>}
          </ChartCard>
        </div>
      )}

      {/* Recent orders */}
      {!loading && orders.length > 0 && (
        <div className={`rounded-2xl border p-6 transition-colors duration-300 ${dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-head font-bold">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-accent hover:underline">View all →</Link>
          </div>
          <div className="space-y-0 divide-y divide-ink-100 dark:divide-dm-border">
            {orders.slice(0, 5).map((o) => (
              <div key={o._id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{o.product?.name}</p>
                  <p className="text-xs text-ink-400 dark:text-dm-muted">{o.user?.name} · {o.user?.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-head font-bold text-sm">₹{o.totalAmount?.toLocaleString()}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    { pending:'bg-accent-light text-accent-dark', approved:'bg-accent-light text-accent-dark', active:'bg-success-light text-success', cancelled:'bg-danger-light text-danger', returned:'bg-ink-100 text-ink-500' }[o.status] || 'bg-ink-100 text-ink-500'
                  }`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
