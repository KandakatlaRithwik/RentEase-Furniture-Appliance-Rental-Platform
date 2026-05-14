import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productAPI }  from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DEMO_PRODUCTS } from '../data/demoProducts';
import ProductCard from '../components/common/ProductCard';
import EmptyState  from '../components/common/EmptyState';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = ['all','furniture','appliance'];
const SUB_CATS   = {
  all:       ['all','bed','sofa','table','wardrobe','fridge','washing_machine','tv','ac'],
  furniture: ['all','bed','sofa','table','wardrobe'],
  appliance: ['all','fridge','washing_machine','tv','ac'],
};
const SORTS = [
  { value:'default',    label:'Relevance'        },
  { value:'price_asc',  label:'Price: Low → High'},
  { value:'price_desc', label:'Price: High → Low'},
  { value:'name_asc',   label:'Name A–Z'         },
];

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-dm-card rounded-2xl border border-ink-100 dark:border-dm-border overflow-hidden">
      <div className="skeleton h-48 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-3 w-20 rounded-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-3 w-1/3" />
      </div>
    </div>
  );
}

export default function Products() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  const category    = searchParams.get('category')    || 'all';
  const subCategory = searchParams.get('subCategory') || 'all';
  const search      = searchParams.get('search')      || '';
  const sort        = searchParams.get('sort')        || 'default';

  const load = useCallback(async () => {
    setLoading(true); setUsingDemo(false);
    try {
      const params = {};
      if (category    !== 'all') params.category    = category;
      if (subCategory !== 'all') params.subCategory = subCategory;
      if (search)                params.search      = search;

      const { data } = await productAPI.getAll(params);
      const list = data.products || [];

      // ✅ If API returns empty or fails, gracefully fall back to demo data
      if (list.length === 0 && !search && category === 'all' && subCategory === 'all') {
        setProducts(DEMO_PRODUCTS);
        setUsingDemo(true);
      } else {
        setProducts(list);
      }
    } catch {
      // ✅ NEVER show broken page — always show demo products
      setProducts(DEMO_PRODUCTS);
      setUsingDemo(true);
    } finally { setLoading(false); }
  }, [category, subCategory, search]);

  useEffect(() => { load(); }, [load]);

  const set = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val === 'all' || !val) p.delete(key); else p.set(key, val);
    if (key === 'category') p.delete('subCategory');
    setSearchParams(p);
  };

  const sorted = [...products].sort((a, b) => {
    if (sort === 'price_asc')  return a.monthlyRent - b.monthlyRent;
    if (sort === 'price_desc') return b.monthlyRent - a.monthlyRent;
    if (sort === 'name_asc')   return a.name.localeCompare(b.name);
    return 0;
  });

  const subs = SUB_CATS[category] || SUB_CATS.all;
  const filterBtnBase = 'px-4 py-2 rounded-full text-sm font-bold transition-all duration-200';
  const subBtnBase    = 'px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 capitalize';

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">

      {/* Demo mode banner */}
      {usingDemo && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-light border border-accent/20 text-sm text-accent-dark font-medium">
          <span>⚡</span>
          <span>Showing demo products — connect your backend to see live inventory.</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-head text-2xl font-bold">
          {search ? `Results for "${search}"` : category === 'all' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1)}
        </h1>
        <p className="text-sm text-ink-400 mt-1">
          {loading ? 'Loading...' : `${sorted.length} product${sorted.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Filter bar */}
      <div className={`flex flex-wrap gap-2 mb-6 p-3 rounded-2xl border ${dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100'}`}
           style={{ boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => set('category', c)}
            className={`${filterBtnBase} ${category === c
              ? 'bg-primary text-white shadow-sm'
              : dark ? 'text-dm-muted border border-dm-border hover:border-primary hover:text-primary' : 'bg-ink-50 text-ink-600 border border-ink-200 hover:border-primary hover:text-primary'
            }`}>
            {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}

        <div className={`w-px mx-1 self-stretch ${dark ? 'bg-dm-border' : 'bg-ink-200'}`} />

        {subs.map((s) => (
          <button key={s} onClick={() => set('subCategory', s)}
            className={`${subBtnBase} ${subCategory === s
              ? 'bg-ink-800 dark:bg-dm-text text-white dark:text-dm-bg'
              : dark ? 'text-dm-muted border border-dm-border hover:border-dm-subtle' : 'text-ink-500 border border-ink-200 hover:border-ink-400'
            }`}>
            {s === 'all' ? 'All Types' : s.replace('_', ' ')}
          </button>
        ))}

        <div className="ml-auto">
          <select value={sort} onChange={(e) => set('sort', e.target.value)}
            className={`text-sm rounded-xl px-3 py-2 outline-none focus:border-primary cursor-pointer border
              ${dark ? 'bg-dm-hover border-dm-border text-dm-text' : 'bg-white border-ink-200 text-ink-700'}`}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Search tag */}
      {search && (
        <div className="flex items-center gap-2 mb-5">
          <span className="text-sm text-ink-600">Searching for:</span>
          <span className="flex items-center gap-1.5 bg-primary-light text-primary-dark text-xs font-bold px-3 py-1 rounded-full">
            {search}
            <button onClick={() => set('search', '')} className="ml-1 font-black hover:text-primary-dark">✕</button>
          </span>
        </div>
      )}

      {/* Skeletons */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && sorted.length === 0 && (
        <EmptyState icon="🔍" title="No products found"
          message={search ? `No results for "${search}". Try a different keyword.` : 'No products match your filters.'}
          actionLabel="Clear Filters" onAction={() => setSearchParams({})} />
      )}

      {/* Grid */}
      {!loading && sorted.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sorted.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
