import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderAPI, maintenanceAPI } from '../services/api';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PageError  from '../components/common/PageError';
import EmptyState from '../components/common/EmptyState';

const STATUS_META = {
  pending:   { label:'Pending',   cls:'bg-accent-light text-accent-dark',   icon:'⏳' },
  approved:  { label:'Approved',  cls:'bg-primary-light text-primary-dark', icon:'✅' },
  delivered: { label:'Delivered', cls:'bg-teal-light text-teal',            icon:'🚚' },
  active:    { label:'Active',    cls:'bg-success-light text-success',       icon:'✔️' },
  returned:  { label:'Returned',  cls:'bg-ink-100 text-ink-500',            icon:'📦' },
  cancelled: { label:'Cancelled', cls:'bg-danger-light text-danger',        icon:'❌' },
  closed:    { label:'Closed',    cls:'bg-ink-100 text-ink-400',            icon:'🔒' },
};
const EMOJI = { bed:'🛏️',sofa:'🛋️',table:'🪑',wardrobe:'🪞',fridge:'❄️',washing_machine:'🌀',tv:'📺',ac:'🌬️' };
const TABS  = ['active_rentals','all','pending','approved','returned','cancelled'];

export default function Dashboard() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [tab,        setTab]        = useState('active_rentals');
  const [cancelling, setCancelling] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(null);
  const [maintenanceType, setMaintenanceType] = useState('');
  const [maintenanceDesc, setMaintenanceDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await orderAPI.getMy();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your orders.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    if (cancelling) return;
    setCancelling(id);
    try {
      await orderAPI.cancel(id);
      toast.success('Order cancelled');
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel');
    } finally { setCancelling(null); }
  };

  const handleReturn = async (id) => {
    if (!window.confirm('Mark this rental as returned?')) return;
    try {
      await orderAPI.updateStatus(id, { status: 'returned' });
      toast.success('Rental marked as returned');
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status: 'returned' } : o));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to mark as returned');
    }
  };

  const handleSubmitMaintenance = async (orderId) => {
    if (!maintenanceType.trim()) return toast.error('Please select service type');
    if (!maintenanceDesc.trim()) return toast.error('Please describe the issue');
    
    setSubmitting(true);
    try {
      await maintenanceAPI.create({ orderId, issue: maintenanceDesc, priority: maintenanceType });
      toast.success('Maintenance request submitted! Admin will review shortly.');
      setShowMaintenanceModal(null);
      setMaintenanceType('');
      setMaintenanceDesc('');
      // Refresh orders to show updated status if needed
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit request');
    } finally { setSubmitting(false); }
  };

  // Active rentals = delivered or active status
  const activeRentals = orders.filter((o) => ['delivered', 'active'].includes(o.status));
  
  // Filter logic for tabs
  let filtered = orders;
  if (tab === 'active_rentals') {
    filtered = activeRentals;
  } else if (tab !== 'all') {
    filtered = orders.filter((o) => o.status === tab);
  }

  const stats = {
    active:  orders.filter((o) => o.status === 'active').length,
    pending: orders.filter((o) => ['pending','approved'].includes(o.status)).length,
    total:   orders.length,
    spend:   orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + (o.totalAmount||0), 0),
  };

  const card  = dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100';
  const hover = dark ? 'hover:border-dm-subtle' : 'hover:shadow-card';

  if (loading) return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
    </div>
  );

  if (error) return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      <PageError message={error} onRetry={load} />
    </div>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">

      <div className="flex items-end justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="font-head text-2xl font-bold">My Dashboard</h1>
          <p className="text-sm text-ink-400 dark:text-dm-muted mt-0.5">Hello, {user?.name?.split(' ')[0]} 👋</p>
        </div>
        <Link to="/products" className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all duration-200 shadow-sm hover:-translate-y-0.5">
          + New Rental
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label:'Active Rentals', value:stats.active,                           icon:'✅', color:'text-success',  bg: dark ? 'bg-success/10 border-success/20' : 'bg-success-light border-success/10' },
          { label:'Pending Orders', value:stats.pending,                          icon:'⏳', color:'text-accent',   bg: dark ? 'bg-accent/10 border-accent/20'   : 'bg-accent-light border-accent/10'  },
          { label:'Total Orders',   value:stats.total,                            icon:'📦', color:'text-primary',  bg: dark ? 'bg-primary/10 border-primary/20' : 'bg-primary-light border-primary/10'},
          { label:'Total Spent',    value:`₹${stats.spend.toLocaleString()}`,     icon:'💰', color:'text-purple',   bg: dark ? 'bg-purple/10 border-purple/20'   : 'bg-purple-light border-purple/10'  },
        ].map((s) => (
          <div key={s.label} className={`flex flex-col gap-1 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${s.bg}`}
               style={{ boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
            <span className="text-2xl">{s.icon}</span>
            <span className={`font-head text-2xl font-extrabold ${s.color}`}>{s.value}</span>
            <span className="text-xs text-ink-400 dark:text-dm-muted font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={`flex gap-0 border-b mb-5 overflow-x-auto ${dark ? 'border-dm-border' : 'border-ink-200'}`}>
        {TABS.map((t) => {
          let count = 0;
          if (t === 'active_rentals') count = activeRentals.length;
          else if (t === 'all') count = orders.length;
          else count = orders.filter((o) => o.status === t).length;
          
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all duration-200
                ${tab === t ? 'border-primary text-primary' : `border-transparent ${dark ? 'text-dm-muted hover:text-dm-text' : 'text-ink-400 hover:text-ink-700'}`}`}>
              {t === 'active_rentals' ? '🏠 Active Rentals' : t.charAt(0).toUpperCase() + t.slice(1)}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t ? 'bg-primary text-white' : dark ? 'bg-dm-hover text-dm-muted' : 'bg-ink-100 text-ink-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <EmptyState icon="📭" title="No orders found"
          message={tab === 'active_rentals' ? 'Your active rentals will appear here once approved.' : tab === 'all' ? 'Start by browsing our catalog and renting something.' : `No "${tab}" orders.`}
          actionLabel="Browse Products" actionTo="/products" />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const meta  = STATUS_META[order.status] || STATUS_META.pending;
            const emoji = EMOJI[order.product?.subCategory] || '📦';
            const startDate = new Date(order.startDate);
            const endDate = new Date(order.endDate);
            const now = new Date();
            const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            const isActive = order.status === 'active' || order.status === 'delivered';
            
            return (
              <div key={order._id}
                className={`rounded-2xl border p-5 flex items-center gap-4 flex-wrap transition-all duration-200 ${card} ${hover}`}
                style={{ boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : undefined }}>
                <div className="text-4xl flex-shrink-0">{emoji}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-head font-bold text-[15px] mb-1">{order.product?.name || 'Product'}</h3>
                  <div className={`flex items-center gap-3 flex-wrap text-xs ${dark ? 'text-dm-muted' : 'text-ink-400'}`}>
                    <span className={`px-2 py-0.5 rounded-full capitalize font-medium ${dark ? 'bg-dm-hover' : 'bg-ink-100'}`}>{order.product?.category}</span>
                    <span>📅 {startDate.toLocaleDateString('en-IN')} → {endDate.toLocaleDateString('en-IN')}</span>
                    <span>⏱️ {order.tenureMonths} month{order.tenureMonths > 1 ? 's' : ''}</span>
                    {isActive && daysLeft > 0 && <span className="text-success font-bold">✅ {daysLeft} days left</span>}
                    {isActive && daysLeft <= 0 && <span className="text-danger font-bold">⚠️ Due today or past</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-head font-extrabold text-lg">₹{order.totalAmount?.toLocaleString()}</p>
                    <p className={`text-xs ${dark ? 'text-dm-muted' : 'text-ink-400'}`}>₹{order.monthlyRent}/mo</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.cls}`}>{meta.icon} {meta.label}</span>
                  <div className="flex gap-2 flex-wrap">
                    {order.status === 'pending' && (
                      <button onClick={() => handleCancel(order._id)} disabled={cancelling === order._id}
                        className="px-3 py-1.5 text-xs font-bold text-danger border border-danger/30 rounded-lg hover:bg-danger-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {cancelling === order._id ? '...' : 'Cancel'}
                      </button>
                    )}
                    {isActive && (
                      <>
                        <button onClick={() => setShowMaintenanceModal(order._id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${dark ? 'border-accent text-accent hover:bg-[#1D2630]' : 'border-accent text-accent hover:bg-accent/10'}`}>
                          🔧 Service
                        </button>
                        <button onClick={() => handleReturn(order._id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${dark ? 'border-danger text-danger hover:bg-[#1D2630]' : 'border-danger text-danger hover:bg-danger-light'}`}>
                          🚚 Return
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Maintenance Request Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowMaintenanceModal(null)}>
          <div className={`w-full max-w-md rounded-2xl border shadow-xl overflow-hidden transition-colors ${dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100'}`}
               onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${dark ? 'border-dm-border' : 'border-ink-100'}`}>
              <h2 className="font-head font-bold text-lg">Service Request</h2>
              <button onClick={() => setShowMaintenanceModal(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-ink-100 dark:hover:bg-dm-hover transition-colors text-lg">✕</button>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-dm-muted mb-1.5">Service Type *</label>
                <select value={maintenanceType} onChange={(e) => setMaintenanceType(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all ${dark ? 'bg-dm-hover border-dm-border text-dm-text' : 'border-ink-200'} focus:border-accent focus:ring-2 focus:ring-accent/15`}>
                  <option value="">Select service type...</option>
                  <option value="low">🔧 Minor Repair</option>
                  <option value="medium">🛠️ Standard Maintenance</option>
                  <option value="high">⚠️ Urgent Issue</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-dm-muted mb-1.5">Description *</label>
                <textarea rows={4} value={maintenanceDesc} onChange={(e) => setMaintenanceDesc(e.target.value)} placeholder="Describe the issue in detail..."
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all resize-none ${dark ? 'bg-dm-hover border-dm-border text-dm-text' : 'border-ink-200'} focus:border-accent focus:ring-2 focus:ring-accent/15`} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => handleSubmitMaintenance(showMaintenanceModal)} disabled={submitting}
                  className="flex-1 px-6 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? '⏳ Submitting...' : 'Submit Request'}
                </button>
                <button type="button" onClick={() => setShowMaintenanceModal(null)}
                  className={`flex-1 px-6 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 ${dark ? 'border-dm-border text-dm-muted hover:bg-dm-hover' : 'border-ink-200 text-ink-600 hover:bg-ink-50'}`}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

