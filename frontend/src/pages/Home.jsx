import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { DEMO_PRODUCTS } from '../data/demoProducts';
import ProductCard from '../components/common/ProductCard';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
  { icon:'🛏️', label:'Beds',             sub:'bed'             },
  { icon:'🛋️', label:'Sofas',            sub:'sofa'            },
  { icon:'🪑', label:'Tables',           sub:'table'           },
  { icon:'🪞', label:'Wardrobes',        sub:'wardrobe'        },
  { icon:'❄️', label:'Fridges',          sub:'fridge'          },
  { icon:'🌀', label:'Washing Machines', sub:'washing_machine' },
  { icon:'📺', label:'TVs',              sub:'tv'              },
  { icon:'🌬️', label:'ACs',              sub:'ac'              },
];

const WHY = [
  { icon:'💸', title:'Save Thousands',        desc:'No upfront purchase cost. Pay monthly, stress-free.'  },
  { icon:'🔧', title:'Free Maintenance',      desc:'Our team handles repairs. You just use the product.'  },
  { icon:'🚚', title:'Free Delivery & Setup', desc:'We deliver, assemble, and set up everything for you.' },
  { icon:'↩️', title:'Hassle-Free Return',    desc:'Moving out? We pick it up — no questions asked.'     },
  { icon:'📅', title:'Flexible Tenure',       desc:'1 to 24 months — extend or return whenever you need.' },
  { icon:'🌱', title:'Sustainable Choice',    desc:'Rent instead of buy. Good for wallet and planet.'     },
];

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-dm-card rounded-2xl border border-ink-100 dark:border-dm-border overflow-hidden">
      <div className="skeleton h-44 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  );
}

export default function Home() {
  const { dark } = useTheme();
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    productAPI.getAll({ limit: 8 })
      .then(({ data }) => {
        const list = data.products || [];
        setFeatured(list.length > 0 ? list.slice(0, 8) : DEMO_PRODUCTS.slice(0, 8));
      })
      .catch(() => setFeatured(DEMO_PRODUCTS.slice(0, 8)))
      .finally(() => setLoading(false));
  }, []);

  const sectionBg = dark ? 'bg-dm-card' : 'bg-ink-50';
  const cardBg    = dark ? 'bg-dm-hover border-dm-border hover:border-primary/40' : 'bg-white border-ink-100 hover:border-primary/30';

  return (
    <div className="transition-colors duration-300">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden"
        style={{ background: dark
          ? 'linear-gradient(135deg, #010409 0%, #0D1117 40%, #161B22 70%, #0F9D8A22 100%)'
          : 'linear-gradient(135deg, #11132A 0%, #1a3a6e 50%, #0F9D8A 100%)' }}>

        {/* Glow blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
               style={{ background: 'radial-gradient(circle, #2874F0, transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15"
               style={{ background: 'radial-gradient(circle, #FB641B, transparent 70%)', filter: 'blur(60px)' }} />
        </div>

        <div className="relative max-w-screen-xl mx-auto px-4 py-20 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-white/10 text-accent text-xs font-bold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase border border-accent/30 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
              India's #1 Rental Platform
            </span>
            <h1 className="font-head text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Furnish your home.<br />
              <span className="text-accent" style={{ textShadow: '0 0 40px rgba(251,100,27,0.4)' }}>
                No buying needed.
              </span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
              Premium furniture & appliances on monthly rental. Perfect for students, working professionals, and anyone who values flexibility.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link to="/products"
                className="px-7 py-3.5 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5"
                style={{ boxShadow: '0 8px 24px rgba(251,100,27,0.35)' }}>
                Browse Products →
              </Link>
              <Link to="/register"
                className="px-7 py-3.5 glass text-white font-bold rounded-xl text-sm transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5">
                Get Started Free
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-10 justify-center lg:justify-start">
              {[['10,000+','Happy Renters'],['15+','Cities'],['500+','Products'],['4.8★','Rating']].map(([val, lbl]) => (
                <div key={lbl} className="text-center">
                  <p className="font-head font-extrabold text-2xl text-white">{val}</p>
                  <p className="text-white/50 text-xs mt-0.5">{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero graphic */}
          <div className="hidden lg:flex flex-1 justify-center items-center relative">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 rounded-full animate-float" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 0 80px rgba(40,116,240,0.3)' }} />
              <div className="absolute inset-8 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <div className="absolute inset-0 flex items-center justify-center text-9xl select-none">🏠</div>
              {[
                { emoji:'🛋️', cls:'top-2 right-2'    },
                { emoji:'❄️', cls:'bottom-4 right-0'  },
                { emoji:'📺', cls:'top-6 left-0'      },
                { emoji:'🌀', cls:'bottom-2 left-4'   },
              ].map(({ emoji, cls }) => (
                <div key={emoji} className={`absolute ${cls} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl`}
                     style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className={`${sectionBg} py-14 transition-colors duration-300`}>
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-head text-2xl font-bold mb-1">How it works</h2>
            <p className="text-ink-400 text-sm">Rent in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* connector line on desktop */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/30 via-accent/30 to-teal/30" />
            {[
              { step:'01', icon:'🛍️', title:'Browse & Pick',   desc:'Browse 500+ products across furniture and appliances.' },
              { step:'02', icon:'📅', title:'Choose Your Plan', desc:'Select tenure from 1–24 months. Pick a delivery date.'  },
              { step:'03', icon:'🏠', title:'Enjoy & Return',   desc:'We deliver, set up, maintain, and pick up when done.'   },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className={`relative flex flex-col items-center text-center p-7 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${cardBg}`}
                   style={{ boxShadow: dark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)' }}>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-extrabold tracking-widest text-primary bg-primary-light px-2.5 py-0.5 rounded-full">{step}</span>
                <span className="text-4xl mb-3 mt-2">{icon}</span>
                <h3 className="font-head font-bold mb-1.5">{title}</h3>
                <p className="text-sm text-ink-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-screen-xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <h2 className="font-head text-2xl font-bold mb-1">Browse by Category</h2>
          <p className="text-ink-400 text-sm">From bedroom to kitchen — we have everything</p>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIES.map((c) => (
            <Link key={c.label} to={`/products?subCategory=${c.sub}`}
              className={`group flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${cardBg}`}
              style={{ boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{c.icon}</span>
              <span className="text-xs font-bold text-ink-600 dark:text-dm-muted group-hover:text-primary transition-colors text-center leading-tight">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className={`${sectionBg} py-14 transition-colors duration-300`}>
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="font-head text-2xl font-bold mb-1">Featured Products</h2>
              <p className="text-ink-400 text-sm">Top picks loved by renters across India</p>
            </div>
            <Link to="/products" className="text-sm font-bold text-primary hover:underline whitespace-nowrap">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading
              ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
              : featured.map((p) => <ProductCard key={p._id} product={p} />)
            }
          </div>
        </div>
      </section>

      {/* ── Why RentEase ── */}
      <section className="max-w-screen-xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="font-head text-2xl font-bold mb-1">Why RentEase?</h2>
          <p className="text-ink-400 text-sm">Built for modern renters who value flexibility</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY.map((w) => (
            <div key={w.title} className={`p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${cardBg}`}
                 style={{ boxShadow: dark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)' }}>
              <span className="text-3xl mb-3 block">{w.icon}</span>
              <h3 className="font-head font-bold mb-1.5">{w.title}</h3>
              <p className="text-sm text-ink-500 dark:text-dm-muted leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className={`${sectionBg} py-14 transition-colors duration-300`}>
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-head text-2xl font-bold mb-1">What renters say</h2>
            <p className="text-ink-400 text-sm">Real stories from real customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name:'Priya S.',  city:'Bangalore', text:'Moved cities 3 times and RentEase made every move effortless. The team picked up and re-delivered everything!',            rating:5 },
              { name:'Rahul M.', city:'Hyderabad', text:'As a student, buying furniture was out of question. RentEase gave me a fully furnished room for ₹2,500/month.',           rating:5 },
              { name:'Ananya T.',city:'Mumbai',    text:'Free maintenance is a game changer. My AC broke at midnight — they fixed it by morning. Highly recommend.',                rating:5 },
            ].map((t) => (
              <div key={t.name} className={`p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${cardBg}`}
                   style={{ boxShadow: dark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)' }}>
                <div className="flex gap-0.5 mb-3">{'★'.repeat(t.rating).split('').map((s,i) => <span key={i} className="text-yellow-400 text-sm">{s}</span>)}</div>
                <p className="text-sm text-ink-600 dark:text-dm-muted leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-ink-400">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 relative overflow-hidden"
        style={{ background: dark
          ? 'linear-gradient(135deg, #161B22 0%, #0D1117 100%)'
          : 'linear-gradient(135deg, #2874F0 0%, #0F9D8A 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at center, rgba(251,100,27,0.12) 0%, transparent 70%)' }} />
        <div className="relative max-w-xl mx-auto px-4 text-center">
          <h2 className="font-head text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to furnish your home?
          </h2>
          <p className="text-white/70 text-sm mb-8 leading-relaxed">
            Join thousands of happy renters. Start with just one month — no long commitments required.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/products"
              className="px-7 py-3 bg-white text-primary font-bold rounded-xl text-sm hover:-translate-y-0.5 transition-all duration-300"
              style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              Browse Now
            </Link>
            <Link to="/register"
              className="px-7 py-3 glass text-white font-bold rounded-xl text-sm hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-300">
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
