import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const { login, isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (!authLoading && isLoggedIn) navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
  }, [isLoggedIn, isAdmin, authLoading, navigate]);

  const onSubmit = async ({ email, password }) => {
    const result = await login(email, password);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}! 👋`);
      navigate(result.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  const inputCls = (hasErr) => `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-200
    ${dark ? 'bg-dm-hover text-dm-text placeholder:text-dm-muted' : 'bg-white text-ink-800 placeholder:text-ink-400'}
    ${hasErr
      ? 'border-danger focus:ring-2 focus:ring-danger/20'
      : dark
        ? 'border-dm-border focus:border-primary focus:ring-2 focus:ring-primary/20'
        : 'border-ink-200 focus:border-primary focus:ring-2 focus:ring-primary/15'
    }`;

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${dark ? 'bg-dm-bg' : 'bg-ink-50'}`}>

      {/* Left promo */}
      <div className="hidden lg:flex flex-col justify-center flex-[0_0_44%] relative overflow-hidden px-12"
        style={{ background: dark
          ? 'linear-gradient(135deg, #010409 0%, #0D1117 60%, #0F9D8A15 100%)'
          : 'linear-gradient(135deg, #1a3a6e 0%, #2874F0 60%, #0F9D8A 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(40,116,240,0.2), transparent 60%)' }} />
        <div className="relative max-w-sm">
          <Link to="/" className="flex items-center gap-2.5 mb-10">
            <span className="text-3xl">🏠</span>
            <span className="font-head font-extrabold text-2xl text-white">RentEase</span>
          </Link>
          <h2 className="font-head text-3xl font-extrabold text-white mb-4 leading-tight">
            Your home,<br />furnished.
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-8">
            Rent premium furniture & appliances monthly. No upfront cost, no maintenance worries.
          </p>
          <div className="space-y-3">
            {['Free delivery & setup','Free maintenance support','Flexible tenure plans','Easy relocation'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-white/85">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <span className="text-3xl">🏠</span>
            <span className="font-head font-extrabold text-2xl text-primary">RentEase</span>
          </Link>

          {/* Dark toggle */}
          <div className="flex justify-end mb-4">
            <button onClick={toggle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200
                ${dark ? 'bg-dm-card border-dm-border text-dm-muted hover:text-dm-text' : 'bg-white border-ink-200 text-ink-500 hover:text-ink-700'}`}>
              {dark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          <div className={`rounded-2xl border p-8 transition-colors duration-300
            ${dark ? 'bg-dm-card border-dm-border shadow-dark-card' : 'bg-white border-ink-100 shadow-card'}`}>
            <h1 className="font-head text-2xl font-bold mb-1">Welcome back</h1>
            <p className="text-sm text-ink-400 dark:text-dm-muted mb-7">Sign in to your account</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 text-ink-600 dark:text-dm-muted">Email Address</label>
                <input type="email" placeholder="you@example.com" className={inputCls(errors.email)}
                  {...register('email', {
                    required: 'Email is required',
                    pattern:  { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                  })} />
                {errors.email && <p className="field-error">⚠ {errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 text-ink-600 dark:text-dm-muted">Password</label>
                <input type="password" placeholder="Enter your password" className={inputCls(errors.password)}
                  {...register('password', { required: 'Password is required' })} />
                {errors.password && <p className="field-error">⚠ {errors.password.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:-translate-y-0.5 mt-1">
                {isSubmitting ? '⏳ Signing in...' : 'Sign In'}
              </button>
            </form>


            <p className="text-center text-sm text-ink-400 dark:text-dm-muted mt-5">
              New here? <Link to="/register" className="text-primary font-bold hover:underline">Create an account →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
