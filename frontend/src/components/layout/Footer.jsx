import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function Footer() {
  const { dark } = useTheme();
  return (
    <footer className={`pt-12 pb-0 mt-12 transition-colors duration-300 ${dark ? 'bg-dm-card border-t border-dm-border' : 'bg-ink-900'}`}>
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🏠</span>
              <span className="font-head font-extrabold text-white text-xl">RentEase</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-4">Premium furniture & appliance rentals for students and professionals. Zero stress, full flexibility.</p>
            <div className="flex gap-2">
              {['📘','📸','🐦','💼'].map((s,i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:-translate-y-0.5 text-sm">{s}</a>
              ))}
            </div>
          </div>
          {[
            { head:'Quick Links', links:[{l:'Home',to:'/'},{l:'Browse Products',to:'/products'},{l:'Furniture',to:'/products?category=furniture'},{l:'Appliances',to:'/products?category=appliance'}] },
            { head:'My Account',  links:[{l:'My Rentals',to:'/dashboard'},{l:'Maintenance',to:'/maintenance'},{l:'Login',to:'/login'},{l:'Sign Up',to:'/register'}] },
          ].map((col) => (
            <div key={col.head}>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">{col.head}</h4>
              <ul className="space-y-2">
                {col.links.map((lk) => (
                  <li key={lk.l}><Link to={lk.to} className="text-sm text-white/50 hover:text-accent transition-colors duration-200">{lk.l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-white/50">
              {['📞 1800-000-RENT','📧 support@rentease.com','⏰ Mon–Sat 9AM–7PM','📍 Available in 15+ cities'].map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4 text-xs text-white/35">
          <p>© 2024 RentEase. All rights reserved.</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {['🔒 Secure Payments','🚚 Free Delivery','🔧 Free Maintenance'].map((b) => (
              <span key={b} className="bg-white/8 px-3 py-1 rounded-full">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
