import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { maintenanceAPI } from '../../services/api';
import PageError from '../../components/common/PageError';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AdminMaintenance() {
  const { dark } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('open');
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await maintenanceAPI.getAll({ status: filter });
      setRequests(data.requests || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load maintenance requests.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      await maintenanceAPI.update(id, { status: newStatus });
      toast.success(`Request marked as ${newStatus}`);
      setRequests((prev) => prev.map((r) => r._id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update request');
    } finally {
      setUpdating(null);
    }
  };

  const card = dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100';
  const th = `text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap text-ink-500 dark:text-dm-muted ${dark ? 'bg-dm-hover' : 'bg-ink-50'}`;
  const td = `px-4 py-3 border-b text-sm transition-colors ${dark ? 'border-dm-border' : 'border-ink-50'}`;
  const muted = dark ? 'text-dm-muted' : 'text-ink-400';

  const filtered = requests.filter((r) => !filter || r.status === filter);
  const counts = {
    open: requests.filter((r) => r.status === 'open').length,
    in_progress: requests.filter((r) => r.status === 'in_progress').length,
    resolved: requests.filter((r) => r.status === 'resolved').length,
    closed: requests.filter((r) => r.status === 'closed').length,
  };

  if (error) return <PageError message={error} onRetry={load} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-head text-2xl font-bold">Maintenance Requests</h1>
        <p className={`text-sm mt-0.5 ${muted}`}>{requests.length} total requests</p>
      </div>

      {/* Status filter */}
      <div className={`flex gap-0 border-b overflow-x-auto ${dark ? 'border-dm-border' : 'border-ink-200'}`}>
        {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all capitalize
              ${filter === status ? 'border-accent text-accent' : `border-transparent ${muted} hover:text-ink-700`}`}
          >
            {status.replace('_', ' ')}
            {counts[status] > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full ${filter === status ? 'bg-accent text-white' : dark ? 'bg-dm-hover text-dm-muted' : 'bg-ink-100 text-ink-500'}`}>
                {counts[status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔧" title="No maintenance requests" message={filter ? `No ${filter} requests.` : 'No requests yet.'} />
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                {['Issue','Customer','Product','Priority','Date','Status','Action'].map((h,i) => <th key={i} className={th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((req) => (
                  <tr key={req._id} className={`transition-colors ${dark ? 'hover:bg-dm-hover' : 'hover:bg-ink-50'}`}>
                    <td className={td}>
                      <span className="font-semibold text-sm">{req.issue}</span>
                    </td>
                    <td className={td}>
                      <p className="font-semibold text-[13px]">{req.user?.name}</p>
                      <p className={`text-[11px] ${muted}`}>{req.user?.email}</p>
                    </td>
                    <td className={td}>
                      <p className="font-semibold text-[13px]">{req.product?.name}</p>
                    </td>
                    <td className={td}>
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full capitalize ${
                        req.priority === 'high' ? 'bg-danger-light text-danger' :
                        req.priority === 'medium' ? 'bg-accent-light text-accent-dark' :
                        'bg-success-light text-success'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className={`${td} ${muted} text-xs`}>
                      {new Date(req.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className={td}>
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full capitalize ${
                        req.status === 'open' ? 'bg-accent-light text-accent-dark' :
                        req.status === 'in_progress' ? 'bg-primary-light text-primary-dark' :
                        req.status === 'resolved' ? 'bg-success-light text-success' :
                        'bg-ink-100 text-ink-500'
                      }`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={td}>
                      {req.status !== 'closed' && (
                        <select value={req.status} onChange={(e) => handleStatusChange(req._id, e.target.value)} disabled={updating === req._id}
                          className={`text-xs px-2 py-1 rounded border outline-none cursor-pointer ${
                            dark ? 'bg-dm-hover border-dm-border text-dm-text' : 'bg-white border-ink-200'
                          } disabled:opacity-50`}>
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
