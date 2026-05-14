import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminAPI, orderAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import PageError  from '../../components/common/PageError';
import EmptyState from '../../components/common/EmptyState';

const STATUS_FLOW = { pending:'approved', approved:'delivered', delivered:'active', active:'returned', returned:'closed' };
const STATUS_CLS  = {
  pending:   'bg-accent-light text-accent-dark',
  approved:  'bg-primary-light text-primary-dark',
  delivered: 'bg-teal-light text-teal',
  active:    'bg-success-light text-success',
  returned:  'bg-ink-100 text-ink-500',
  cancelled: 'bg-danger-light text-danger',
  closed:    'bg-ink-100 text-ink-400',
};
const STATUS_ALL = ['pending','approved','delivered','active','returned','cancelled','closed'];

export default function AdminOrders() {
  const { dark } = useTheme();
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [filter,     setFilter]     = useState('');
  const [advancing,  setAdvancing]  = useState(null);
  const [expanded,   setExpanded]   = useState(null);
  const [search,     setSearch]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await adminAPI.getAllOrders({ limit: 200 });
      setOrders(data.orders || []);
    } catch (err) { setError(err?.response?.data?.message || 'Failed to load orders.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const advance = async (orderId, next) => {
    if (advancing) return;
    setAdvancing(orderId);
    try {
      await orderAPI.updateStatus(orderId, { status: next });
      setOrders((p) => p.map((o) => o._id === orderId ? { ...o, status: next } : o));
      toast.success(`Order marked as ${next}`);
    } catch (err) { toast.error(err?.response?.data?.message || 'Update failed'); }
    finally { setAdvancing(null); }
  };

  const filtered = orders
    .filter((o) => !filter || o.status === filter)
    .filter((o) => !search || o.user?.name?.toLowerCase().includes(search.toLowerCase()) || o.product?.name?.toLowerCase().includes(search.toLowerCase()) || o._id.includes(search));

  const counts = STATUS_ALL.reduce((acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s).length }), {});

  const card = dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100';
  const th   = `text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap text-ink-500 dark:text-dm-muted ${dark ? 'bg-dm-hover' : 'bg-ink-50'}`;
  const td   = `px-4 py-3 border-b text-sm transition-colors ${dark ? 'border-dm-border' : 'border-ink-50'}`;
  const muted = dark ? 'text-dm-muted' : 'text-ink-400';

  if (error) return <PageError message={error} onRetry={load} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-head text-2xl font-bold">Orders</h1>
        <p className={`text-sm mt-0.5 ${muted}`}>{orders.length} total orders</p>
      </div>

      {/* Status tab strip */}
      <div className={`flex gap-0 border-b overflow-x-auto ${dark ? 'border-dm-border' : 'border-ink-200'}`}>
        <button onClick={() => setFilter('')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all
            ${!filter ? 'border-accent text-accent' : `border-transparent ${muted} hover:text-ink-700`}`}>
          All <span className={`px-1.5 py-0.5 rounded-full ${!filter ? 'bg-accent text-white' : dark ? 'bg-dm-hover text-dm-muted' : 'bg-ink-100 text-ink-500'}`}>{orders.length}</span>
        </button>
        {STATUS_ALL.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all capitalize
              ${filter === s ? 'border-accent text-accent' : `border-transparent ${muted} hover:text-ink-700`}`}>
            {s} {counts[s] > 0 && <span className={`px-1.5 py-0.5 rounded-full ${filter === s ? 'bg-accent text-white' : dark ? 'bg-dm-hover text-dm-muted' : 'bg-ink-100 text-ink-500'}`}>{counts[s]}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by customer name, product, or order ID..."
        className={`w-full max-w-sm px-3 py-2 rounded-xl border text-sm outline-none transition-all ${dark ? 'bg-dm-hover border-dm-border text-dm-text placeholder:text-dm-muted' : 'border-ink-200'} focus:border-accent focus:ring-2 focus:ring-accent/15`} />

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📋" title="No orders found" message={filter ? `No ${filter} orders.` : 'No orders yet.'} />
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                {['','Product','Customer','Dates','Amount','Status','Action'].map((h,i) => <th key={i} className={th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((o) => (
                  <>
                    <tr key={o._id} className={`transition-colors cursor-pointer ${dark ? 'hover:bg-dm-hover' : 'hover:bg-ink-50'}`}
                        onClick={() => setExpanded(expanded === o._id ? null : o._id)}>
                      <td className={td}>
                        <span className="text-ink-400 text-xs">{expanded === o._id ? '▼' : '▶'}</span>
                      </td>
                      <td className={td}>
                        <p className="font-semibold text-[13px]">{o.product?.name || '—'}</p>
                        <p className={`text-[11px] ${muted} capitalize`}>{o.product?.category}</p>
                      </td>
                      <td className={td}>
                        <p className="font-semibold text-[13px]">{o.user?.name}</p>
                        <p className={`text-[11px] ${muted}`}>{o.user?.email}</p>
                      </td>
                      <td className={`${td} ${muted} text-xs whitespace-nowrap`}>
                        <p>{new Date(o.startDate).toLocaleDateString('en-IN')}</p>
                        <p>→ {new Date(o.endDate).toLocaleDateString('en-IN')}</p>
                      </td>
                      <td className={td}>
                        <p className="font-head font-bold text-[13px]">₹{o.totalAmount?.toLocaleString()}</p>
                        <p className={`text-[11px] ${muted}`}>₹{o.monthlyRent}/mo × {o.tenureMonths}mo</p>
                      </td>
                      <td className={td}>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_CLS[o.status] || 'bg-ink-100 text-ink-500'}`}>{o.status}</span>
                      </td>
                      <td className={td} onClick={(e) => e.stopPropagation()}>
                        {STATUS_FLOW[o.status] && (
                          <button onClick={() => advance(o._id, STATUS_FLOW[o.status])} disabled={advancing === o._id}
                            className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-bold hover:bg-accent-dark transition-all duration-200 disabled:opacity-50 whitespace-nowrap hover:-translate-y-0.5">
                            {advancing === o._id ? '...' : `→ ${STATUS_FLOW[o.status]}`}
                          </button>
                        )}
                      </td>
                    </tr>
                    {/* Expanded detail row */}
                    {expanded === o._id && (
                      <tr key={`${o._id}-exp`}>
                        <td colSpan={7} className={`px-6 py-4 border-b ${dark ? 'bg-dm-hover border-dm-border' : 'bg-ink-50 border-ink-100'}`}>
                          <div className="grid sm:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-ink-400 dark:text-dm-muted mb-1">Delivery Address</p>
                              <p>{o.deliveryAddress?.street}, {o.deliveryAddress?.city}</p>
                              <p>{o.deliveryAddress?.state} — {o.deliveryAddress?.pincode}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-ink-400 dark:text-dm-muted mb-1">Pricing Breakdown</p>
                              <p>Rent: ₹{o.totalRent?.toLocaleString()}</p>
                              <p>Deposit: ₹{o.securityDeposit?.toLocaleString()}</p>
                              {o.isExtended && <p className="text-success text-xs font-bold">Extended +{o.extensionMonths}mo</p>}
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-ink-400 dark:text-dm-muted mb-1">Order Info</p>
                              <p className="text-[11px] font-mono break-all text-ink-400 dark:text-dm-muted">ID: {o._id}</p>
                              <p>Placed: {new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                              {o.adminNote && <p className="mt-1 text-primary text-xs">Note: {o.adminNote}</p>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
