import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI, orderAPI } from '../../services/api';
import PageError  from '../../components/common/PageError';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

// ✅ FIX: Only show valid next transitions — backend enforces active→returned→closed
const VALID_NEXT = {
  active:   ['active', 'returned'],        // active can only move to returned
  returned: ['returned', 'closed'],        // returned can only move to closed
  closed:   ['closed'],                    // terminal — no action shown
};

export default function AdminReturns() {
  const { dark } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [filter,   setFilter]   = useState('active');
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await adminAPI.getAllOrders({ limit: 500 });
      const relevant = (data.orders || []).filter((o) =>
        ['active', 'returned', 'closed'].includes(o.status)
      );
      setRequests(relevant);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load return requests.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id, currentStatus, newStatus) => {
    if (newStatus === currentStatus) return;
    setUpdating(id);
    try {
      await orderAPI.updateStatus(id, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      setRequests((prev) =>
        prev.map((r) => r._id === id ? { ...r, status: newStatus } : r)
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update order');
    } finally { setUpdating(null); }
  };

  const card  = dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100';
  const th    = `text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap text-ink-500 dark:text-dm-muted ${dark ? 'bg-dm-hover' : 'bg-ink-50'}`;
  const td    = `px-4 py-3 border-b text-sm transition-colors ${dark ? 'border-dm-border' : 'border-ink-50'}`;
  const muted = dark ? 'text-dm-muted' : 'text-ink-400';

  const counts = {
    active:   requests.filter((r) => r.status === 'active').length,
    returned: requests.filter((r) => r.status === 'returned').length,
    closed:   requests.filter((r) => r.status === 'closed').length,
  };
  const displayed = filter ? requests.filter((r) => r.status === filter) : requests;

  if (error) return <PageError message={error} onRetry={load} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-head text-2xl font-bold">Return Requests</h1>
        <p className={`text-sm mt-0.5 ${muted}`}>{requests.length} total requests</p>
      </div>

      {/* Status tabs */}
      <div className={`flex gap-0 border-b overflow-x-auto ${dark ? 'border-dm-border' : 'border-ink-200'}`}>
        {['active','returned','closed'].map((status) => (
          <button key={status} onClick={() => setFilter(status)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all capitalize
              ${filter === status ? 'border-accent text-accent' : `border-transparent ${muted} hover:text-ink-700`}`}>
            {status}
            {counts[status] > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filter === status ? 'bg-accent text-white' : dark ? 'bg-dm-hover text-dm-muted' : 'bg-ink-100 text-ink-500'
              }`}>{counts[status]}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : displayed.length === 0 ? (
        <EmptyState icon="🚚" title="No requests" message={`No ${filter} return requests.`} />
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                {['Customer','Product','Rental Ends','Status','Submitted','Action'].map((h) => (
                  <th key={h} className={th}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {displayed.map((order) => {
                  const validOptions = VALID_NEXT[order.status] || [order.status];
                  const isTerminal   = order.status === 'closed';
                  return (
                    <tr key={order._id} className={`transition-colors ${dark ? 'hover:bg-dm-hover' : 'hover:bg-ink-50'}`}>
                      <td className={td}>
                        <p className="font-semibold text-[13px]">{order.user?.name || '—'}</p>
                        <p className={`text-[11px] ${muted}`}>{order.user?.email}</p>
                      </td>
                      <td className={td}>
                        <p className="font-semibold text-[13px]">{order.product?.name || '—'}</p>
                        <p className={`text-[11px] ${muted} capitalize`}>{order.product?.category}</p>
                      </td>
                      <td className={`${td} ${muted} text-xs`}>
                        {order.endDate ? new Date(order.endDate).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className={td}>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${
                          order.status === 'active'   ? 'bg-primary-light text-primary-dark' :
                          order.status === 'returned' ? 'bg-accent-light text-accent-dark'   :
                                                        'bg-ink-100 text-ink-500'
                        }`}>{order.status}</span>
                      </td>
                      <td className={`${td} ${muted} text-xs`}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className={td}>
                        {!isTerminal ? (
                          <select
                            value={order.status}
                            disabled={updating === order._id}
                            onChange={(e) => handleStatusChange(order._id, order.status, e.target.value)}
                            className={`text-xs px-2 py-1.5 rounded-lg border outline-none cursor-pointer capitalize transition-all
                              ${dark ? 'bg-dm-hover border-dm-border text-dm-text' : 'bg-white border-ink-200'}
                              disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {/* ✅ Only show valid transitions — prevents active→closed error */}
                            {validOptions.map((opt) => (
                              <option key={opt} value={opt} className="capitalize">{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[11px] text-ink-400 dark:text-dm-muted italic">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
