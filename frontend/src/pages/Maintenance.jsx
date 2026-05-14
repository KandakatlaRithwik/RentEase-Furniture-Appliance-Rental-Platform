import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { maintenanceAPI, orderAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import PageError  from '../components/common/PageError';
import EmptyState from '../components/common/EmptyState';

const PRIORITY = { low:{ cls:'bg-success-light text-success', label:'Low' }, medium:{ cls:'bg-accent-light text-accent-dark', label:'Medium' }, high:{ cls:'bg-danger-light text-danger', label:'High' } };
const STATUS   = { open:{ cls:'bg-danger-light text-danger', label:'Open' }, in_progress:{ cls:'bg-accent-light text-accent-dark', label:'In Progress' }, resolved:{ cls:'bg-success-light text-success', label:'Resolved' }, closed:{ cls:'bg-ink-100 text-ink-400', label:'Closed' } };

export default function Maintenance() {
  const { dark } = useTheme();
  const [sp] = useSearchParams();
  const prefill = sp.get('orderId') || '';
  const [requests,  setRequests]  = useState([]);
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [showForm,  setShowForm]  = useState(!!prefill);
  const [submitting,setSubmitting]= useState(false);
  const { register, handleSubmit, reset, formState:{errors} } = useForm({ defaultValues:{ orderId:prefill, issue:'', priority:'medium' } });

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [rr, or] = await Promise.all([maintenanceAPI.getMy(), orderAPI.getMy()]);
      setRequests(rr.data.requests || []);
      setOrders((or.data.orders || []).filter((o) => o.status === 'active'));
    } catch (err) { setError(err?.response?.data?.message || 'Failed to load maintenance requests.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (vals) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data } = await maintenanceAPI.create(vals);
      toast.success('Maintenance request raised!');
      setRequests((p) => [data.request, ...p]);
      reset({ orderId:'', issue:'', priority:'medium' });
      setShowForm(false);
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to submit. Try again.'); }
    finally { setSubmitting(false); }
  };

  const card  = dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100';
  const inputC = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-200
    ${dark ? 'bg-dm-hover border-dm-border text-dm-text placeholder:text-dm-muted focus:border-primary focus:ring-2 focus:ring-primary/20'
           : 'border-ink-200 focus:border-primary focus:ring-2 focus:ring-primary/15'}`;

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10 space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="skeleton h-24 rounded-2xl"/>)}</div>;
  if (error)   return <div className="max-w-3xl mx-auto px-4 py-10"><PageError message={error} onRetry={load} /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="font-head text-2xl font-bold">Maintenance</h1>
          <p className={`text-sm mt-0.5 ${dark ? 'text-dm-muted' : 'text-ink-400'}`}>Track and raise service requests</p>
        </div>
        {orders.length > 0 && (
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
            {showForm ? '✕ Cancel' : '+ New Request'}
          </button>
        )}
      </div>

      {showForm && (
        <div className={`rounded-2xl border p-6 mb-6 animate-fade-in transition-colors duration-300 ${card}`}
             style={{ boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.07)' }}>
          <h2 className="font-head font-bold mb-5">Raise a Request</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 text-ink-600 dark:text-dm-muted">Active Rental</label>
              <select className={`${inputC} ${errors.orderId ? 'border-danger' : ''}`} {...register('orderId',{required:'Select a rental'})}>
                <option value="">— Select a rental —</option>
                {orders.map((o) => <option key={o._id} value={o._id}>{o.product?.name} (since {new Date(o.startDate).toLocaleDateString('en-IN')})</option>)}
              </select>
              {errors.orderId && <p className="field-error">⚠ {errors.orderId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2 text-ink-600 dark:text-dm-muted">Priority</label>
              <div className="flex gap-2">
                {['low','medium','high'].map((p) => (
                  <label key={p} className="cursor-pointer">
                    <input type="radio" value={p} className="sr-only" {...register('priority')} />
                    <span className={`block px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${PRIORITY[p].cls}`}>{PRIORITY[p].label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 text-ink-600 dark:text-dm-muted">Issue Description</label>
              <textarea rows={4} placeholder="Describe the issue in detail (min 10 characters)"
                className={`${inputC} resize-none ${errors.issue ? 'border-danger' : ''}`}
                {...register('issue',{ required:'Describe the issue', minLength:{value:10,message:'At least 10 characters'} })} />
              {errors.issue && <p className="field-error">⚠ {errors.issue.message}</p>}
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-sm">
                {submitting ? '⏳ Submitting...' : 'Submit Request'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 ${dark ? 'border-dm-border text-dm-muted hover:bg-dm-hover' : 'border-ink-200 text-ink-600 hover:bg-ink-50'}`}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && orders.length === 0 && requests.length === 0 && (
        <EmptyState icon="🔧" title="No active rentals" message="Raise a request once you have an active rental." actionLabel="Browse Products" actionTo="/products" />
      )}

      {requests.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-400 dark:text-dm-muted">Your Requests ({requests.length})</p>
          {requests.map((r) => {
            const sm = STATUS[r.status]     || STATUS.open;
            const pm = PRIORITY[r.priority] || PRIORITY.medium;
            return (
              <div key={r._id} className={`rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${card}`}
                   style={{ boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <p className="font-head font-bold text-[15px] mb-0.5">{r.product?.name || 'Product'}</p>
                    <p className={`text-xs ${dark ? 'text-dm-muted' : 'text-ink-400'}`}>{new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${pm.cls}`}>{pm.label}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${sm.cls}`}>{sm.label}</span>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed p-3 rounded-xl mb-3 ${dark ? 'bg-dm-hover text-dm-muted' : 'bg-ink-50 text-ink-600'}`}>{r.issue}</p>
                {r.adminNote && (
                  <div className="flex gap-2.5 bg-primary-light rounded-xl p-3">
                    <span className="text-lg flex-shrink-0">💬</span>
                    <div>
                      <p className="text-xs font-bold text-primary-dark mb-0.5">Team Response</p>
                      <p className="text-sm text-ink-700">{r.adminNote}</p>
                    </div>
                  </div>
                )}
                {r.resolvedAt && <p className="text-xs text-success font-medium mt-3">✅ Resolved on {new Date(r.resolvedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
