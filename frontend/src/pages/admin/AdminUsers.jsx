import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import PageError  from '../../components/common/PageError';
import EmptyState from '../../components/common/EmptyState';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await adminAPI.getAllUsers();
      setUsers(data.users || []);
    } catch (err) { setError(err?.response?.data?.message || 'Failed to load users.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const card  = dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100';
  const th    = `text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-dm-muted whitespace-nowrap ${dark ? 'bg-dm-hover' : 'bg-ink-50'}`;
  const td    = `px-4 py-3.5 border-b text-sm ${dark ? 'border-dm-border' : 'border-ink-50'}`;
  const muted = dark ? 'text-dm-muted' : 'text-ink-400';

  if (error) return <PageError message={error} onRetry={load} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-head text-2xl font-bold">Users</h1>
        <p className={`text-sm mt-0.5 ${muted}`}>{users.length} registered customers</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Total Users',   value: users.length,                                        icon:'👥', color:'text-accent',  bg: dark?'bg-accent/10 border-accent/20':'bg-accent-light border-accent/10' },
          { label:'Active Today',  value: users.filter((u) => { const d=new Date(u.createdAt||0); return (Date.now()-d)<86400000*30; }).length, icon:'✅', color:'text-accent', bg: dark?'bg-accent/10 border-accent/20':'bg-accent-light border-accent/10' },
          { label:'This Month',    value: users.filter((u) => { const d=new Date(u.createdAt||0); return (Date.now()-d)<86400000*30; }).length, icon:'🆕', color:'text-accent', bg: dark?'bg-accent/10 border-accent/20':'bg-accent-light border-accent/10' },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-4 p-5 rounded-2xl border ${s.bg}`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className={`font-head text-2xl font-extrabold ${s.color}`}>{loading ? '—' : s.value}</p>
              <p className={`text-xs font-medium ${muted}`}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users by name or email..."
        className={`w-full max-w-sm px-3 py-2 rounded-xl border text-sm outline-none transition-all ${dark ? 'bg-dm-hover border-dm-border text-dm-text placeholder:text-dm-muted' : 'border-ink-200'} focus:border-accent focus:ring-2 focus:ring-accent/15`} />

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="👥" title="No users found" message="No customers have registered yet." />
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                {['User','Email','Phone','Role','Joined',''].map((h,i) => <th key={i} className={th}>{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-ink-50 dark:divide-dm-border">
                {filtered.map((u) => (
                  <tr key={u._id} className={`transition-colors ${dark ? 'hover:bg-dm-hover' : 'hover:bg-ink-50'}`}>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-accent via-orange-500 to-yellow-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </span>
                        <span className="font-semibold text-[13px]">{u.name}</span>
                      </div>
                    </td>
                    <td className={`${td} ${muted}`}>{u.email}</td>
                    <td className={`${td} ${muted}`}>{u.phone || '—'}</td>
                    <td className={td}>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-light text-purple' : 'bg-accent-light text-accent-dark'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className={`${td} ${muted} text-xs`}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                    </td>
                    <td className={td}>
                      <div className="flex gap-2">
                        <button className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${dark ? 'border-accent text-accent hover:bg-[#1D2630]' : 'border-accent text-accent hover:bg-accent/10'}`}
                          onClick={() => navigate(`/admin/orders?userId=${u._id}`)}>
                          📋 History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={`px-4 py-3 text-xs ${muted} border-t ${dark ? 'border-dm-border' : 'border-ink-100'}`}>
            Showing {filtered.length} of {users.length} users
          </div>
        </div>
      )}
    </div>
  );
}
