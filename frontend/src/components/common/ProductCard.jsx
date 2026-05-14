import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const CAT_STYLE = {
  furniture: { bg: 'bg-primary-light', text: 'text-primary-dark' },
  appliance: { bg: 'bg-teal-light',    text: 'text-teal'         },
};
const COND_BADGE = {
  new:      'bg-purple-light text-purple',
  like_new: 'bg-success-light text-success',
  good:     'bg-primary-light text-primary-dark',
  fair:     'bg-ink-100 text-ink-500',
};
const EMOJI = {
  bed:'🛏️', sofa:'🛋️', table:'🪑', wardrobe:'🪞',
  fridge:'❄️', washing_machine:'🌀', tv:'📺', ac:'🌬️', microwave:'📡',
};

export default function ProductCard({ product }) {
  const { dark } = useTheme();
  const { isAdmin } = useAuth();
  const cat    = CAT_STYLE[product.category]   || CAT_STYLE.furniture;
  const cond   = COND_BADGE[product.condition] || COND_BADGE.good;
  const emoji  = EMOJI[product.subCategory]    || '📦';
  const avail  = product.availableQuantity > 0;

  return (
    <Link
      to={`/products/${product._id}`}
      className={`group flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer
        ${dark
          ? 'bg-dm-card border-dm-border hover:border-primary/50 hover:shadow-dark-hover'
          : 'bg-white border-ink-100 hover:border-primary/30 hover:shadow-hover'
        }`}
      style={{ transform: 'translateY(0)', transition: 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.3s ease, border-color 0.3s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Image area */}
      <div className={`relative h-48 overflow-hidden flex-shrink-0 ${dark ? 'bg-dm-hover' : 'bg-ink-50'}`}>
        {product.images?.length > 0 ? (
          <img src={product.images[0]} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br
            ${dark ? 'from-dm-hover to-dm-bg' : 'from-ink-100 to-ink-50'}`}>
            <span className="text-6xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">{emoji}</span>
          </div>
        )}

        {/* Out of stock overlay */}
        {!avail && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-widest uppercase">Out of Stock</span>
          </div>
        )}

        {/* Condition badge */}
        <span className={`absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full backdrop-blur-sm ${cond}`}>
          {product.condition?.replace('_', ' ') || 'Good'}
        </span>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); }}
          className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-white/80 dark:bg-dm-card/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm hover:bg-white hover:scale-110"
        >🤍</button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5 p-4 flex-1">
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full w-fit ${cat.bg} ${cat.text}`}>
          {product.category} · {product.subCategory?.replace('_', ' ')}
        </span>

        <h3 className="font-head font-semibold text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {product.name}
        </h3>

        {product.brand && <p className="text-xs text-ink-400">by <span className="font-medium">{product.brand}</span></p>}

        {/* Price */}
        <div className="mt-1">
          <div className="flex items-baseline gap-1">
            <span className="font-head text-2xl font-extrabold text-primary">₹{product.monthlyRent.toLocaleString()}</span>
            <span className="text-xs text-ink-400">/month</span>
          </div>
          <p className="text-xs text-ink-400 mt-0.5">
            Deposit: <span className="font-semibold text-ink-600 dark:text-dm-muted">₹{product.securityDeposit.toLocaleString()}</span>
          </p>
        </div>

        {/* Tenure pills */}
        <div className="flex gap-1.5 flex-wrap mt-0.5">
          {product.tenureOptions?.map((t) => (
            <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-light text-primary-dark">{t}M</span>
          ))}
        </div>

        {/* Footer row */}
        <div className={`flex items-center justify-between mt-auto pt-3 border-t ${dark ? 'border-dm-border' : 'border-ink-100'}`}>
          <span className={`flex items-center gap-1.5 text-xs font-medium ${avail ? 'text-success' : 'text-danger'}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse-soft ${avail ? 'bg-success' : 'bg-danger'}`} />
            {avail ? `${product.availableQuantity} available` : 'Unavailable'}
          </span>
          <span className="text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all duration-200 text-accent">
            {isAdmin ? 'Admin Preview' : 'Rent Now'} <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
