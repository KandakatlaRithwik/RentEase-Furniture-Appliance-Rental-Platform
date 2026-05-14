import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import PageError  from '../../components/common/PageError';
import EmptyState from '../../components/common/EmptyState';

const EMPTY_FORM = {
  name:'', description:'', category:'furniture', subCategory:'bed',
  monthlyRent:'', securityDeposit:'', tenureOptions:[3,6,12],
  totalQuantity:'', availableQuantity:'', brand:'', condition:'good',
  city:'All', isActive:true, imageUrl:'', imagePreview:'',
};
const SUBCATS = {
  furniture: ['bed','sofa','table','chair','wardrobe'],
  appliance: ['fridge','washing_machine','tv','ac','microwave'],
};
const CONDITIONS = ['new','like_new','good','fair'];
const STATUS_CLS = { new:'bg-purple-light text-purple', like_new:'bg-success-light text-success', good:'bg-accent-light text-accent-dark', fair:'bg-ink-100 text-ink-500' };

export default function AdminProducts() {
  const { dark } = useTheme();
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [modal,      setModal]      = useState(null);   // null | 'add' | 'edit'
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search,     setSearch]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await productAPI.getAll();
      setProducts(data.products || []);
    } catch (err) { setError(err?.response?.data?.message || 'Failed to load products.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(EMPTY_FORM); setEditId(null); setModal('add'); };
  const openEdit = (p) => {
    setForm({ ...p, monthlyRent: p.monthlyRent, securityDeposit: p.securityDeposit, totalQuantity: p.totalQuantity, availableQuantity: p.availableQuantity });
    setEditId(p._id); setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditId(null); };

  const F = (key, val) => {
    setForm((f) => {
      const next = { ...f, [key]: val };
      // reset subCategory when category changes
      if (key === 'category') next.subCategory = SUBCATS[val][0];
      return next;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim())          return toast.error('Product name is required');
    if (!form.monthlyRent)          return toast.error('Monthly rent is required');
    if (!form.securityDeposit)      return toast.error('Security deposit is required');
    if (!form.totalQuantity)        return toast.error('Total quantity is required');
    if (!form.availableQuantity)    return toast.error('Available quantity is required');
    if (Number(form.availableQuantity) > Number(form.totalQuantity))
      return toast.error('Available quantity cannot exceed total quantity');

    setSaving(true);
    try {
      const payload = {
        ...form,
        monthlyRent:       Number(form.monthlyRent),
        securityDeposit:   Number(form.securityDeposit),
        totalQuantity:     Number(form.totalQuantity),
        availableQuantity: Number(form.availableQuantity),
        // ✅ Convert imageUrl string → images array for backend
        images: form.imageUrl ? [form.imageUrl] : (form.images || []),
      };
      if (modal === 'edit') {
        const { data } = await productAPI.update(editId, payload);
        setProducts((p) => p.map((x) => x._id === editId ? data.product || { ...x, ...payload } : x));
        toast.success('Product updated!');
      } else {
        const { data } = await productAPI.create(payload);
        setProducts((p) => [data.product, ...p]);
        toast.success('Product added!');
      }
      closeModal();
    } catch (err) { toast.error(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    if (deletingId) return;
    setDeletingId(id);
    try {
      await productAPI.delete(id);
      setProducts((p) => p.filter((x) => x._id !== id));
      toast.success('Product deleted');
    } catch (err) { toast.error(err?.response?.data?.message || 'Delete failed'); }
    finally { setDeletingId(null); }
  };

  const toggleActive = async (p) => {
    try {
      await productAPI.update(p._id, { isActive: !p.isActive });
      setProducts((prev) => prev.map((x) => x._id === p._id ? { ...x, isActive: !x.isActive } : x));
      toast.success(p.isActive ? 'Product deactivated' : 'Product activated');
    } catch { toast.error('Update failed'); }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.includes(search.toLowerCase())
  );

  const card  = dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100';
  const inp   = `w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all ${dark ? 'bg-dm-hover border-dm-border text-dm-text' : 'border-ink-200'} focus:border-accent focus:ring-2 focus:ring-accent/15`;
  const th    = `text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap text-ink-500 dark:text-dm-muted ${dark ? 'bg-dm-hover' : 'bg-ink-50'}`;
  const td    = `px-4 py-3 border-b text-sm transition-colors ${dark ? 'border-dm-border' : 'border-ink-50'}`;

  if (error) return <PageError message={error} onRetry={load} />;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-head text-2xl font-bold">Products</h1>
          <p className="text-sm text-ink-400 dark:text-dm-muted mt-0.5">{products.length} items in inventory</p>
        </div>
        <button onClick={openAdd}
          className="px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent-dark transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
          + Add Product
        </button>
      </div>

      {/* Search */}
      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products by name or category..."
        className={`${inp} max-w-sm`} />

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📦" title="No products found" message="Add your first product to get started." actionLabel="Add Product" onAction={openAdd} />
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                {['Product','Category','Rent/mo','Deposit','Stock','Condition','Status','Actions'].map((h) => <th key={h} className={th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} className={`transition-colors ${dark ? 'hover:bg-dm-hover' : 'hover:bg-ink-50'}`}>
                    <td className={td}>
                      <p className="font-semibold">{p.name}</p>
                      {p.brand && <p className="text-xs text-ink-400 dark:text-dm-muted">{p.brand}</p>}
                    </td>
                    <td className={td}>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${p.category === 'furniture' ? 'bg-accent-light text-accent-dark' : 'bg-teal-light text-teal'}`}>
                        {p.category}
                      </span>
                      <p className="text-xs text-ink-400 dark:text-dm-muted mt-0.5 capitalize">{p.subCategory?.replace('_',' ')}</p>
                    </td>
                    <td className={`${td} font-semibold text-accent`}>₹{p.monthlyRent?.toLocaleString()}</td>
                    <td className={`${td} text-ink-500 dark:text-dm-muted`}>₹{p.securityDeposit?.toLocaleString()}</td>
                    <td className={td}>
                      <span className={`font-bold ${p.availableQuantity > 0 ? 'text-success' : 'text-danger'}`}>
                        {p.availableQuantity}
                      </span>
                      <span className="text-ink-400 dark:text-dm-muted"> / {p.totalQuantity}</span>
                    </td>
                    <td className={td}>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_CLS[p.condition] || 'bg-ink-100 text-ink-500'}`}>
                        {p.condition?.replace('_',' ')}
                      </span>
                    </td>
                    <td className={td}>
                      <button onClick={() => toggleActive(p)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${p.isActive ? 'bg-success-light text-success hover:bg-success hover:text-white' : 'bg-danger-light text-danger hover:bg-danger hover:text-white'}`}>
                        {p.isActive ? '● Active' : '● Inactive'}
                      </button>
                    </td>
                    <td className={td}>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${dark ? 'border-dm-border text-dm-muted hover:bg-dm-hover' : 'border-ink-200 text-ink-600 hover:bg-ink-50'}`}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(p._id)} disabled={deletingId === p._id}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-danger/30 text-danger hover:bg-danger-light transition-all duration-200 disabled:opacity-50">
                          {deletingId === p._id ? '...' : '🗑️ Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className={`w-full max-w-2xl rounded-2xl border shadow-xl overflow-hidden transition-colors ${dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100'}`}
               onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${dark ? 'border-dm-border' : 'border-ink-100'}`}>
              <h2 className="font-head font-bold text-lg">{modal === 'add' ? '+ Add New Product' : '✏️ Edit Product'}</h2>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-ink-100 dark:hover:bg-dm-hover transition-colors text-lg">✕</button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-dm-muted mb-1.5">Product Name *</label>
                  <input value={form.name} onChange={(e) => F('name', e.target.value)} placeholder="e.g. King Size Bed with Storage" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-dm-muted mb-1.5">Category *</label>
                  <select value={form.category} onChange={(e) => F('category', e.target.value)} className={inp}>
                    <option value="furniture">Furniture</option>
                    <option value="appliance">Appliance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-dm-muted mb-1.5">Sub-Category *</label>
                  <select value={form.subCategory} onChange={(e) => F('subCategory', e.target.value)} className={inp}>
                    {(SUBCATS[form.category] || []).map((s) => (
                      <option key={s} value={s}>{s.replace('_',' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-dm-muted mb-1.5">Monthly Rent (₹) *</label>
                  <input type="number" min="0" value={form.monthlyRent} onChange={(e) => F('monthlyRent', e.target.value)} placeholder="e.g. 899" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-dm-muted mb-1.5">Security Deposit (₹) *</label>
                  <input type="number" min="0" value={form.securityDeposit} onChange={(e) => F('securityDeposit', e.target.value)} placeholder="e.g. 1800" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-dm-muted mb-1.5">Total Quantity *</label>
                  <input type="number" min="1" value={form.totalQuantity} onChange={(e) => F('totalQuantity', e.target.value)} placeholder="e.g. 5" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-dm-muted mb-1.5">Available Quantity *</label>
                  <input type="number" min="0" value={form.availableQuantity} onChange={(e) => F('availableQuantity', e.target.value)} placeholder="e.g. 5" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-dm-muted mb-1.5">Brand</label>
                  <input value={form.brand} onChange={(e) => F('brand', e.target.value)} placeholder="e.g. Samsung" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-dm-muted mb-1.5">Condition</label>
                  <select value={form.condition} onChange={(e) => F('condition', e.target.value)} className={inp}>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-dm-muted mb-1.5">City</label>
                  <input value={form.city} onChange={(e) => F('city', e.target.value)} placeholder="All / Hyderabad / etc." className={inp} />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => F('isActive', e.target.checked)}
                    className="w-4 h-4 accent-accent" />
                  <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">Active (visible to users)</label>
                </div>
                {/* ✅ NEW: Image Upload Section */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-dm-muted mb-1.5">
                    Product Image
                  </label>
                  <div className="space-y-2">
                    {/* Image URL input */}
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => {
                        F('imageUrl', e.target.value);
                        F('imagePreview', e.target.value);
                      }}
                      placeholder="Paste image URL (e.g. https://images.unsplash.com/photo-...)"
                      className={inp}
                    />
                    {/* OR divider */}
                    <div className="flex items-center gap-3">
                      <div className={`flex-1 h-px ${dark ? 'bg-dm-border' : 'bg-ink-200'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-dm-muted' : 'text-ink-400'}`}>or upload file</span>
                      <div className={`flex-1 h-px ${dark ? 'bg-dm-border' : 'bg-ink-200'}`} />
                    </div>
                    {/* File upload */}
                    <label className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-all
                      ${dark ? 'border-dm-border hover:border-accent text-dm-muted' : 'border-ink-200 hover:border-accent text-ink-500'}`}>
                      <span className="text-lg">📷</span>
                      <span className="text-sm font-medium">Choose image from device</span>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            F('imageUrl', ev.target.result);
                            F('imagePreview', ev.target.result);
                          };
                          reader.readAsDataURL(file);
                        }} />
                    </label>
                    {/* Live preview */}
                    {form.imageUrl && (
                      <div className="relative">
                        <img
                          src={form.imageUrl}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg border border-ink-200 dark:border-dm-border"
                          onError={(e) => { e.target.style.display='none'; }}
                        />
                        <button type="button"
                          onClick={() => { F('imageUrl',''); F('imagePreview',''); }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-danger text-white text-xs flex items-center justify-center hover:bg-red-700 transition-colors">
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-dm-muted mb-1.5">Description</label>
                  <textarea rows={3} value={form.description} onChange={(e) => F('description', e.target.value)} placeholder="Brief product description..." className={`${inp} resize-none`} />
                </div>
              </div>

              <div className={`flex gap-3 pt-2 border-t ${dark ? 'border-dm-border' : 'border-ink-100'}`}>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-sm">
                  {saving ? '⏳ Saving...' : modal === 'add' ? '+ Add Product' : '✅ Save Changes'}
                </button>
                <button type="button" onClick={closeModal}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 ${dark ? 'border-dm-border text-dm-muted hover:bg-dm-hover' : 'border-ink-200 text-ink-600 hover:bg-ink-50'}`}>
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
