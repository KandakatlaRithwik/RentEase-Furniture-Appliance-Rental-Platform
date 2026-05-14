import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productAPI, orderAPI } from '../services/api';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PageError from '../components/common/PageError';
import { DEMO_PRODUCTS } from '../data/demoProducts';

const EMOJI = { bed:'🛏️',sofa:'🛋️',table:'🪑',wardrobe:'🪞',fridge:'❄️',washing_machine:'🌀',tv:'📺',ac:'🌬️' };

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { dark } = useTheme();
  const isAdmin = user?.role === 'admin';


  const [product,      setProduct]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [tenure,       setTenure]       = useState(null);
  const [startDate,    setStartDate]    = useState('');
  const [endDate,      setEndDate]      = useState('');
  const [address,      setAddress]      = useState({ street:'', city:'', state:'', pincode:'' });
  const [booking,      setBooking]      = useState(false);
  const [avail,        setAvail]        = useState(null);
  const [checkingAvail,setCheckingAvail]= useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await productAPI.getOne(id);
      setProduct(data.product);
      setTenure(data.product.tenureOptions?.[0] || null);
    } catch {
      // Fallback to demo product for portfolio demos
      const demo = DEMO_PRODUCTS.find((p) => p._id === id);
      if (demo) { setProduct(demo); setTenure(demo.tenureOptions[0]); }
      else setError('Product not found.');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (startDate && tenure) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + tenure);
      setEndDate(d.toISOString().split('T')[0]);
      setAvail(null);
    }
  }, [startDate, tenure]);

  const checkAvailability = async () => {
    if (!startDate || !endDate) { toast.error('Select a start date first'); return; }
    setCheckingAvail(true);
    try {
      const { data } = await orderAPI.checkAvailability({ productId: id, startDate, endDate });
      setAvail(data);
    } catch (err) { toast.error(err?.response?.data?.message || 'Could not check availability'); }
    finally { setCheckingAvail(false); }
  };

  const handleBook = async () => {
    if (isAdmin) {
      toast.error('Admin preview only — renting is disabled for admin users.');
      return;
    }
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!tenure)     { toast.error('Please select a rental tenure'); return; }
    if (!startDate)  { toast.error('Please select a start date'); return; }
    if (!address.street)  { toast.error('Please enter street address'); return; }
    if (!address.city)    { toast.error('Please enter city'); return; }
    if (!address.state)   { toast.error('Please enter state'); return; }
    if (!address.pincode) { toast.error('Please enter pincode'); return; }
    // ✅ FIX: Indian pincodes are exactly 6 digits — "5001" was failing backend validation
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error('Pincode must be exactly 6 digits (e.g. 506001)');
      return;
    }
    if (avail && !avail.available) { toast.error('Product unavailable for these dates'); return; }
    if (booking) return;
    setBooking(true);
    try {
      await orderAPI.create({ productId: id, startDate, endDate, tenureMonths: tenure, deliveryAddress: address });
      toast.success('Order placed! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to place order. Try again.');
    } finally { setBooking(false); }
  };

  const today   = new Date().toISOString().split('T')[0];
  const card    = dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100';
  const inputCls = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-200
    ${dark ? 'bg-dm-hover border-dm-border text-dm-text placeholder:text-dm-muted focus:border-primary focus:ring-2 focus:ring-primary/20'
           : 'border-ink-200 focus:border-primary focus:ring-2 focus:ring-primary/15'}`;

  if (loading) return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="skeleton h-96 rounded-2xl" />
        <div className="space-y-4">
          {[...Array(5)].map((_,i) => <div key={i} className={`skeleton h-${i===0?8:i===4?40:12} rounded-xl`} />)}
        </div>
      </div>
    </div>
  );

  if (error)   return <div className="max-w-screen-xl mx-auto px-4 py-10"><PageError message={error} onRetry={load} /></div>;
  if (!product) return null;

  const emoji       = EMOJI[product.subCategory] || '📦';
  const totalRent   = (product.monthlyRent||0) * (tenure||0);
  const totalAmount = totalRent + (product.securityDeposit||0);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">

      {/* Breadcrumb */}
      <nav className="text-sm text-ink-400 dark:text-dm-muted mb-6 flex items-center gap-2 flex-wrap">
        <a href="/"         className="hover:text-primary transition-colors">Home</a> <span>/</span>
        <a href="/products" className="hover:text-primary transition-colors">Products</a> <span>/</span>
        <span className="dark:text-dm-text font-medium">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 items-start">

        {/* Left */}
        <div className="space-y-5">
          <div className={`rounded-2xl overflow-hidden border transition-colors duration-300 ${card}`}
               style={{ height: 360, boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.08)' }}>
            {product.images?.length > 0 ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${dark ? 'bg-dm-hover' : 'bg-ink-50'}`}>
                <span className="text-9xl drop-shadow-lg">{emoji}</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}
               style={{ boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 className="font-head font-bold text-lg mb-4">Product Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Category',  product.category],
                ['Type',      product.subCategory?.replace('_',' ')],
                ['Brand',     product.brand || 'N/A'],
                ['Condition', product.condition?.replace('_',' ') || 'Good'],
                ['Color',     product.color  || 'N/A'],
                ['Stock',     `${product.availableQuantity} / ${product.totalQuantity}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-ink-400 dark:text-dm-muted uppercase tracking-wide font-bold mb-0.5">{label}</p>
                  <p className="font-semibold capitalize">{value}</p>
                </div>
              ))}
            </div>
            {product.description && (
              <div className={`pt-4 mt-4 border-t ${dark ? 'border-dm-border' : 'border-ink-100'}`}>
                <p className="text-xs text-ink-400 dark:text-dm-muted uppercase tracking-wide font-bold mb-1.5">Description</p>
                <p className="text-sm text-ink-600 dark:text-dm-muted leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right — sticky booking */}
        <div className="sticky top-24 space-y-4">

          {/* Price + title */}
          <div className={`rounded-2xl border p-6 transition-colors duration-300 ${card}`}
               style={{ boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.08)' }}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h1 className="font-head text-xl font-bold leading-tight mb-1">{product.name}</h1>
                {product.brand && <p className="text-sm text-ink-400 dark:text-dm-muted">by {product.brand}</p>}
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${product.availableQuantity > 0 ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                {product.availableQuantity > 0 ? '● In Stock' : '● Out of Stock'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-head text-3xl font-extrabold text-primary">₹{product.monthlyRent.toLocaleString()}</span>
              <span className="text-sm text-ink-400 dark:text-dm-muted">/ month</span>
            </div>
            <p className="text-sm text-ink-500 dark:text-dm-muted">
              Security Deposit: <strong className="dark:text-dm-text">₹{product.securityDeposit.toLocaleString()}</strong>
              <span className="text-ink-400 dark:text-dm-muted"> (refundable)</span>
            </p>
          </div>

          {/* Booking form */}
          <div className={`rounded-2xl border p-6 space-y-4 transition-colors duration-300 ${card}`}
               style={{ boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.08)' }}>
            <h3 className="font-head font-bold">Book this product</h3>

            {/* Tenure */}
            <div>
              <label className="block text-xs font-bold text-ink-600 dark:text-dm-muted uppercase tracking-wide mb-2">Rental Tenure</label>
              <div className="flex flex-wrap gap-2">
                {product.tenureOptions?.map((t) => (
                  <button key={t} onClick={() => setTenure(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200
                      ${tenure === t
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : dark ? 'border-dm-border text-dm-muted hover:border-primary hover:text-primary' : 'border-ink-200 text-ink-600 hover:border-primary hover:text-primary'}`}>
                    {t} Month{t > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Start date */}
            <div>
              <label className="block text-xs font-bold text-ink-600 dark:text-dm-muted uppercase tracking-wide mb-1.5">Start Date</label>
              <input type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
            </div>

            {/* End date */}
            {endDate && (
              <div className={`rounded-xl px-4 py-3 flex justify-between text-sm ${dark ? 'bg-dm-hover' : 'bg-ink-50'}`}>
                <span className="text-ink-500 dark:text-dm-muted text-xs font-medium">Auto-calculated end date</span>
                <span className="font-bold">{new Date(endDate).toLocaleDateString('en-IN')}</span>
              </div>
            )}

            {/* Check availability */}
            {startDate && (
              <button onClick={checkAvailability} disabled={checkingAvail}
                className="w-full py-2.5 rounded-xl border border-primary text-primary text-sm font-bold hover:bg-primary-light transition-all duration-200 disabled:opacity-50">
                {checkingAvail ? '⏳ Checking...' : '🔍 Check Availability'}
              </button>
            )}

            {/* Availability result */}
            {avail && (
              <div className={`flex items-center gap-2.5 p-3 rounded-xl text-sm font-medium ${avail.available ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                <span className="text-xl">{avail.available ? '✅' : '❌'}</span>
                {avail.available ? 'Available for your dates!' : `Unavailable — ${avail.overlappingOrders} booking(s) overlap.`}
              </div>
            )}

            {/* Delivery address */}
            <div>
              <label className="block text-xs font-bold text-ink-600 dark:text-dm-muted uppercase tracking-wide mb-2">Delivery Address</label>
              <div className="space-y-2">
                <input placeholder="Street address" value={address.street} onChange={(e) => setAddress((a) => ({...a,street:e.target.value}))} className={inputCls} />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="City"    value={address.city}    onChange={(e) => setAddress((a) => ({...a,city:e.target.value}))}    className={inputCls} />
                  <input placeholder="State"   value={address.state}   onChange={(e) => setAddress((a) => ({...a,state:e.target.value}))}   className={inputCls} />
                </div>
                <input placeholder="Pincode" value={address.pincode} onChange={(e) => setAddress((a) => ({...a,pincode:e.target.value}))} className={inputCls} />
              </div>
            </div>

            {/* Price summary */}
            {tenure && (
              <div className={`rounded-xl p-4 space-y-2 text-sm ${dark ? 'bg-dm-hover' : 'bg-ink-50'}`}>
                <div className="flex justify-between"><span className="text-ink-500 dark:text-dm-muted">Rent (₹{product.monthlyRent} × {tenure}mo)</span><span className="font-semibold">₹{totalRent.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-ink-500 dark:text-dm-muted">Security Deposit</span><span className="font-semibold">₹{product.securityDeposit.toLocaleString()}</span></div>
                <div className={`h-px ${dark ? 'bg-dm-border' : 'bg-ink-200'}`} />
                <div className="flex justify-between font-head font-extrabold text-base"><span>Total Payable</span><span className="text-primary">₹{totalAmount.toLocaleString()}</span></div>
                <p className="text-[10px] text-ink-400 dark:text-dm-muted">Deposit refunded at return in good condition</p>
              </div>
            )}

            {/* Book button */}
            <button onClick={handleBook} disabled={booking || !product.availableQuantity || isAdmin}
              className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-dark text-white font-head font-extrabold text-base transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:-translate-y-0.5">
              {booking ? '⏳ Placing Order...' : isAdmin ? 'Admin Preview' : !isLoggedIn ? '🔐 Login to Rent' : '🛒 Confirm & Rent'}
            </button>
            {isAdmin && (
              <p className="text-xs text-ink-500 dark:text-dm-muted mt-2">Admins can browse products here, but renting is disabled in the storefront.</p>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[['🚚','Free Delivery'],['🔧','Free Maintenance'],['↩️','Easy Return']].map(([icon,label]) => (
              <div key={label} className={`rounded-xl border p-3 transition-colors duration-300 ${card}`}>
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-[11px] font-bold text-ink-600 dark:text-dm-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
